class HADashboardCard extends HTMLElement {
    set hass(hass) {
        if (!this.shadowRoot) {
            this.attachShadow({ mode: "open" });
        }

        const entities = Object.values(hass.states).filter(
            e => e.attributes.friendly_name?.startsWith("HADashboard ") &&
                 e.entity_id.startsWith("binary_sensor.")
        );

        this.shadowRoot.innerHTML = `
            <ha-card>
                <div class="grid">
                    ${entities.map(e => `
                        <div class="service-row">
                            <span class="name">${e.attributes.friendly_name.replace("HADashboard ", "")}</span>
                            <span class="ms">${e.attributes.response_time_ms ?? "-"} ms</span>
                            <span class="badge ${e.state === "on" ? "online" : "offline"}">
                                ${e.state === "on" ? "Online" : "Offline"}
                            </span>
                        </div>
                    `).join("")}
                </div>
            </ha-card>
        `;
    }

    setConfig(config) {
        this.config = config;
    }

    getCardSize() {
        return 3;
    }
}

customElements.define("hadashboard-card", HADashboardCard);