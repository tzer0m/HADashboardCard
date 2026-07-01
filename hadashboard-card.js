class HADashboardCard extends HTMLElement {
    setConfig(config) {
        this.config = config;
    }

    set hass(hass) {
        this._hass = hass;

        if (!this.shadowRoot) {
            this.attachShadow({ mode: "open" });
        }

        if (!this._built) {
            this._build();
            this._built = true;
        }

        this._update();
    }

    _getEntities() {
        return Object.values(this._hass.states)
            .filter(e =>
                e.entity_id.startsWith("binary_sensor.") &&
                e.attributes.friendly_name?.startsWith("HADashboard ")
            )
            .sort((a, b) =>
                a.attributes.friendly_name.localeCompare(b.attributes.friendly_name)
            );
    }

    _faviconUrl(attr) {
        return attr.favicon_url
            ? attr.favicon_url
            : `https://tzer0m.co.uk/Favicon?url=${encodeURIComponent(attr.url ?? "")}`;
    }

    _accessIcon(access) {
        return access === "Global"
            ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
               </svg>`
            : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"></path>
               </svg>`;
    }

    _build() {
        this.shadowRoot.innerHTML = `
            <style>
                ha-card {
                    overflow: hidden;
                }
                .grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                    padding: 12px;
                    box-sizing: border-box;
                    overflow: hidden;
                }
                .service-row {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 10px;
                    border-radius: 10px;
                    background: var(--card-background-color);
                    border: 1px solid var(--divider-color);
                    cursor: pointer;
                    transition: background 0.15s;
                    min-width: 0;
                    overflow: hidden;
                    min-height: 44px;
                    box-sizing: border-box;
                }
                .service-row:hover {
                    background: var(--secondary-background-color);
                }
                .favicon {
                    width: 20px;
                    height: 20px;
                    border-radius: 4px;
                    object-fit: contain;
                    flex-shrink: 0;
                }
                .favicon-fallback {
                    width: 20px;
                    height: 20px;
                    border-radius: 4px;
                    background: var(--secondary-background-color);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 10px;
                    font-weight: bold;
                    color: var(--primary-text-color);
                    flex-shrink: 0;
                }
                .name {
                    flex: 1;
                    font-size: 11px;
                    font-weight: 500;
                    color: var(--primary-text-color);
                    white-space: normal;
                    word-break: break-word;
                    min-width: 0;
                    line-height: 1.3;
                }
                .ms {
                    font-size: 11px;
                    flex-shrink: 0;
                }
                .access-icon {
                    flex-shrink: 0;
                    color: var(--secondary-text-color);
                    display: flex;
                    align-items: center;
                }
                .badge {
                    font-size: 11px;
                    font-weight: 600;
                    padding: 2px 6px;
                    border-radius: 12px;
                    flex-shrink: 0;
                }
                .online { background: #198754; color: #fff; }
                .offline { background: #dc3545; color: #fff; }

                .overlay {
                    display: none;
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.6);
                    z-index: 9999;
                    align-items: center;
                    justify-content: center;
                }
                .overlay.open { display: flex; }
                .popout {
                    background: var(--card-background-color);
                    border-radius: 14px;
                    padding: 24px;
                    min-width: 320px;
                    max-width: 480px;
                    width: 90%;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
                }
                .popout-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 16px;
                }
                .popout-favicon {
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    object-fit: contain;
                }
                .popout-title {
                    font-size: 18px;
                    font-weight: 600;
                    color: var(--primary-text-color);
                    flex: 1;
                }
                .popout-close {
                    cursor: pointer;
                    font-size: 20px;
                    color: var(--secondary-text-color);
                    background: none;
                    border: none;
                    padding: 0;
                    line-height: 1;
                }
                .popout-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px 0;
                    border-bottom: 1px solid var(--divider-color);
                    font-size: 13px;
                }
                .popout-row:last-child { border-bottom: none; }
                .popout-label { color: var(--secondary-text-color); }
                .popout-value {
                    color: var(--primary-text-color);
                    font-weight: 500;
                    text-align: right;
                    max-width: 60%;
                    word-break: break-word;
                }
                .popout-value a {
                    color: var(--primary-color);
                    text-decoration: none;
                }
            </style>

            <ha-card>
                <div class="grid" id="grid"></div>
                <div class="overlay" id="overlay">
                    <div class="popout" id="popout">
                        <div class="popout-header">
                            <img class="popout-favicon" id="popout-favicon" src="" />
                            <span class="popout-title" id="popout-title"></span>
                            <button class="popout-close" id="popout-close">✕</button>
                        </div>
                        <div id="popout-rows"></div>
                    </div>
                </div>
            </ha-card>
        `;

        const overlay = this.shadowRoot.getElementById("overlay");

        this.shadowRoot.getElementById("popout").addEventListener("click", e => e.stopPropagation());
        this.shadowRoot.getElementById("popout-close").addEventListener("click", () => overlay.classList.remove("open"));
        overlay.addEventListener("click", () => overlay.classList.remove("open"));
    }

    _update() {
        const entities = this._getEntities();
        const grid = this.shadowRoot.getElementById("grid");
        const overlay = this.shadowRoot.getElementById("overlay");

        // Only rebuild grid rows if entity list has changed
        const currentIds = [...grid.querySelectorAll(".service-row")].map(r => r.dataset.entity).join(",");
        const newIds = entities.map(e => e.entity_id).join(",");

        if (currentIds !== newIds) {
            grid.innerHTML = entities.map(e => {
                const name = e.attributes.friendly_name.replace("HADashboard ", "");
                return `
                    <div class="service-row" data-entity="${e.entity_id}">
                        <img class="favicon" src="${this._faviconUrl(e.attributes)}"
                            onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" />
                        <div class="favicon-fallback" style="display:none;">${name.charAt(0)}</div>
                        <span class="name">${name}</span>
                        <span class="ms"></span>
                        <span class="access-icon">${this._accessIcon(e.attributes.access ?? "")}</span>
                        <span class="badge"></span>
                    </div>
                `;
            }).join("");

            grid.querySelectorAll(".service-row").forEach(row => {
                row.addEventListener("click", () => {
                    const ms = attr.response_time_ms;
                    const msColour = ms == null ? "var(--secondary-text-color)"
                        : ms <= 200 ? "#198754"
                        : ms <= 500 ? "#e8a33d"
                        : "#dc3545";
                    
                    const lastChecked = attr.last_checked
                        ? new Date(attr.last_checked).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "UTC" }) + " UTC"
                        : "-";
                    
                    const statusBadge = `<span class="badge ${entity.state === "on" ? "online" : "offline"}">${entity.state === "on" ? "Online" : "Offline"}</span>`;
                    
                    const deployState = deployEntity ? deployEntity.state : null;
                    const deployColour = deployState === "passing" ? "#198754"
                        : deployState === "failing" ? "#dc3545"
                        : deployState === "running" ? "#e8a33d"
                        : "var(--secondary-text-color)";
                    const deployBadge = deployState
                        ? `<span class="badge" style="background:${deployColour};color:#fff;">${deployState}</span>`
                        : "-";
                    
                    const rows = [
                        ["Status", statusBadge],
                        ["URL", attr.url ? `<a href="${attr.url}" target="_blank">${attr.url}</a>` : "-"],
                        ["Type", attr.type ?? "-"],
                        ["Access", attr.access ?? "-"],
                        ["Device", attr.device ?? "-"],
                        ["Local IP", attr.local_ip ?? "-"],
                        ["Local Port", attr.local_port != null ? String(attr.local_port) : "-"],
                        ["Response Time", ms != null ? `<span style="color:${msColour};font-weight:600;">${ms} ms</span>` : "-"],
                        ["Last Checked", lastChecked],
                        ["Deploy Status", deployBadge],
                    ];

                    this.shadowRoot.getElementById("popout-rows").innerHTML = rows.map(([label, value]) => `
                        <div class="popout-row">
                            <span class="popout-label">${label}</span>
                            <span class="popout-value">${value}</span>
                        </div>
                    `).join("");

                    overlay.classList.add("open");
                });
            });
        }

        // Always patch live values without rebuilding DOM
        entities.forEach(e => {
            const row = grid.querySelector(`[data-entity="${e.entity_id}"]`);
            if (!row) return;

            const ms = e.attributes.response_time_ms ?? null;
            const msColour = ms === null ? "var(--secondary-text-color)"
                : ms <= 200 ? "#198754"
                : ms <= 500 ? "#e8a33d"
                : "#dc3545";
            const isOnline = e.state === "on";

            const msEl = row.querySelector(".ms");
            msEl.textContent = ms !== null ? `${ms} ms` : "";
            msEl.style.color = msColour;

            const badge = row.querySelector(".badge");
            badge.textContent = isOnline ? "Online" : "Offline";
            badge.className = `badge ${isOnline ? "online" : "offline"}`;
        });
    }

    getCardSize() {
        return Math.ceil(this._getEntities().length / 2);
    }
}

customElements.define("hadashboard-card", HADashboardCard);