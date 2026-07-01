class HADashboardCard extends HTMLElement {
    setConfig(config) {
        this.config = config;
    }

    set hass(hass) {
        if (!this.shadowRoot) {
            this.attachShadow({ mode: "open" });
        }

        const entities = Object.values(hass.states)
            .filter(e =>
                e.entity_id.startsWith("binary_sensor.") &&
                e.attributes.friendly_name?.startsWith("HADashboard ")
            )
            .sort((a, b) =>
                a.attributes.friendly_name.localeCompare(b.attributes.friendly_name)
            );

        this.shadowRoot.innerHTML = `
            <style>
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
                    font-size: 14px;
                    flex-shrink: 0;
                    color: var(--secondary-text-color);
                }
                .badge {
                    font-size: 11px;
                    font-weight: 600;
                    padding: 2px 6px;
                    border-radius: 12px;
                    flex-shrink: 0;
                }
                .online {
                    background: #198754;
                    color: #fff;
                }
                .offline {
                    background: #dc3545;
                    color: #fff;
                }

                /* Popout overlay */
                .overlay {
                    display: none;
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.6);
                    z-index: 9999;
                    align-items: center;
                    justify-content: center;
                }
                .overlay.open {
                    display: flex;
                }
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
                .popout-row:last-child {
                    border-bottom: none;
                }
                .popout-label {
                    color: var(--secondary-text-color);
                }
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
                ha-card {
                    overflow: hidden;
                }
            </style>

            <ha-card>
                <div class="grid">
                    ${entities.map(e => {
                        const name = e.attributes.friendly_name.replace("HADashboard ", "");
                        const ms = e.attributes.response_time_ms ?? null;
                        const msColour = ms === null ? "var(--secondary-text-color)"
                            : ms <= 200 ? "#198754"
                            : ms <= 500 ? "#e8a33d"
                            : "#dc3545";
                        const isOnline = e.state === "on";
                        const access = e.attributes.access ?? "";
                        const accessIcon = access === "Global" ? "🌐" : "🏠";
                        const faviconUrl = e.attributes.favicon_url
                            ? e.attributes.favicon_url
                            : `https://tzer0m.co.uk/Favicon?url=${encodeURIComponent(e.attributes.url ?? "")}`;

                        return `
                            <div class="service-row" data-entity="${e.entity_id}">
                                <img class="favicon" src="${faviconUrl}"
                                    onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"
                                    />
                                <div class="favicon-fallback" style="display:none;">${name.charAt(0)}</div>
                                <span class="name">${name}</span>
                                ${ms !== null ? `<span class="ms" style="color:${msColour};">${ms} ms</span>` : ""}
                                <span class="access-icon">${accessIcon}</span>
                                <span class="badge ${isOnline ? "online" : "offline"}">
                                    ${isOnline ? "Online" : "Offline"}
                                </span>
                            </div>
                        `;
                    }).join("")}
                </div>

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

        // Popout logic
        const overlay = this.shadowRoot.getElementById("overlay");
        const popoutTitle = this.shadowRoot.getElementById("popout-title");
        const popoutFavicon = this.shadowRoot.getElementById("popout-favicon");
        const popoutRows = this.shadowRoot.getElementById("popout-rows");
        const popoutClose = this.shadowRoot.getElementById("popout-close");

        this.shadowRoot.querySelectorAll(".service-row").forEach(row => {
            row.addEventListener("click", () => {
                const entityId = row.dataset.entity;
                const entity = hass.states[entityId];
                const attr = entity.attributes;
                const name = attr.friendly_name.replace("HADashboard ", "");

                popoutTitle.textContent = name;
                popoutFavicon.src = attr.favicon_url
                    ? attr.favicon_url
                    : `https://tzer0m.co.uk/Favicon?url=${encodeURIComponent(attr.url ?? "")}`;

                const rows = [
                    ["Status", entity.state === "on" ? "Online" : "Offline"],
                    ["URL", attr.url ? `<a href="${attr.url}" target="_blank">${attr.url}</a>` : "-"],
                    ["Type", attr.type ?? "-"],
                    ["Access", attr.access ?? "-"],
                    ["Device", attr.device ?? "-"],
                    ["Local IP", attr.local_ip ?? "-"],
                    ["Local Port", attr.local_port ?? "-"],
                    ["Response Time", attr.response_time_ms != null ? `${attr.response_time_ms} ms` : "-"],
                    ["Last Checked", attr.last_checked ?? "-"],
                    ["Deploy Status", attr.deploy_status ?? "-"],
                ];

                popoutRows.innerHTML = rows.map(([label, value]) => `
                    <div class="popout-row">
                        <span class="popout-label">${label}</span>
                        <span class="popout-value">${value}</span>
                    </div>
                `).join("");

                overlay.classList.add("open");
            });
        });

        popoutClose.addEventListener("click", () => overlay.classList.remove("open"));
        overlay.addEventListener("click", e => {
            if (e.target === overlay) overlay.classList.remove("open");
        });
    }

    getCardSize() {
        return Math.ceil(
            Object.values(this._hass?.states ?? {}).filter(e =>
                e.entity_id.startsWith("binary_sensor.") &&
                e.attributes.friendly_name?.startsWith("HADashboard ")
            ).length / 2
        );
    }
}

customElements.define("hadashboard-card", HADashboardCard);