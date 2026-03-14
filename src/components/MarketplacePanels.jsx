import React from "react";

export default function MarketplacePanels({
  styles,
  showAdvancedTools,
  marketLoading,
  handleDomainSearch,
  marketKeyword,
  setMarketKeyword,
  makeProjectSlug,
  projectName,
  setPurchasedDomains,
  marketSort,
  setMarketSort,
  autoSelectBestDomain,
  setAutoSelectBestDomain,
  marketTlds,
  toggleMarketTld,
  marketError,
  purchasedDomains,
  handleUseDomainFromMarket,
  getSortedMarketResults,
  marketBuying,
  handleBuyDomain,
  dnsGuideDomain,
  dnsRecords,
  defaultDnsRecords,
  handleCopyDnsValue,
  handleCopyAllDnsRecords,
  dnsCopyMessage,
  installedAddons,
  addonSearch,
  setAddonSearch,
  addonCategory,
  setAddonCategory,
  getFilteredAddons,
  handleInstallAddon,
  handleUninstallAddon,
  addonNameInput,
  setAddonNameInput,
  addonTypeInput,
  setAddonTypeInput,
  addonPriceInput,
  setAddonPriceInput,
  addonFeaturesInput,
  setAddonFeaturesInput,
  addonDescriptionInput,
  setAddonDescriptionInput,
  handlePublishAddon,
}) {
  return (
    <>
      {showAdvancedTools ? (
        <section style={styles.marketCard}>
          <div style={styles.marketHeader}>
            <h3 style={styles.marketTitle}>Domain Marketplace</h3>
            <button style={styles.marketSearchButton} onClick={handleDomainSearch} disabled={marketLoading}>
              {marketLoading ? "Searching..." : "Search Domains"}
            </button>
          </div>
          <div style={styles.marketControls}>
            <input
              style={styles.marketInput}
              placeholder="Search keyword (brand, niche, business)"
              value={marketKeyword}
              onChange={(event) => setMarketKeyword(event.target.value)}
            />
            <button
              style={styles.marketGhostButton}
              onClick={() => setMarketKeyword(makeProjectSlug(projectName).replace(/-/g, ""))}
            >
              Use Project Name
            </button>
            <button style={styles.marketGhostButton} onClick={() => setPurchasedDomains([])}>
              Clear purchased history
            </button>
            <select style={styles.marketSortSelect} value={marketSort} onChange={(event) => setMarketSort(event.target.value)}>
              <option value="available">Available first</option>
              <option value="cheapest">Cheapest</option>
              <option value="premium">Most premium</option>
            </select>
            <label style={styles.marketToggleLabel}>
              <input
                type="checkbox"
                checked={autoSelectBestDomain}
                onChange={(event) => setAutoSelectBestDomain(event.target.checked)}
              />
              Auto-select best domain
            </label>
          </div>
          <div style={styles.tldChips}>
            {[".com", ".net", ".org", ".io"].map((tld) => {
              const active = marketTlds.includes(tld);
              return (
                <button
                  key={tld}
                  style={active ? styles.tldChipActive : styles.tldChip}
                  onClick={() => toggleMarketTld(tld)}
                >
                  {tld}
                </button>
              );
            })}
          </div>
          {marketError ? <p style={styles.marketError}>{marketError}</p> : null}
          {purchasedDomains.length > 0 ? (
            <div style={styles.purchasedWrap}>
              <strong style={styles.purchasedTitle}>Purchased Domains</strong>
              <div style={styles.purchasedList}>
                {purchasedDomains.map((domain) => (
                  <button key={domain} style={styles.purchasedChip} onClick={() => handleUseDomainFromMarket(domain)}>
                    {domain}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          {getSortedMarketResults().length > 0 ? (
            <div style={styles.marketGrid}>
              {getSortedMarketResults().map((item) => {
                const domainName = String(item?.name || "").toLowerCase();
                const available = Boolean(item?.available);
                const price = Number(item?.price || 0);
                return (
                  <article key={domainName} style={styles.marketItem}>
                    <div>
                      <strong>{domainName}</strong>
                      <p style={styles.marketSub}>
                        {available ? "Available" : "Taken"} • ${Number.isFinite(price) ? price.toFixed(2) : "0.00"}
                      </p>
                    </div>
                    <div style={styles.marketActions}>
                      <button style={styles.marketUseButton} onClick={() => handleUseDomainFromMarket(domainName)}>
                        Use Domain
                      </button>
                      <button
                        style={styles.marketBuyButton}
                        onClick={() => handleBuyDomain(domainName)}
                        disabled={!available || marketBuying === domainName}
                      >
                        {marketBuying === domainName ? "Buying..." : "Buy"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : null}
          {dnsGuideDomain ? (
            <div style={styles.dnsGuide}>
              <h4 style={styles.dnsTitle}>Connect DNS Guide</h4>
              <p style={styles.dnsText}>
                Configure your DNS provider for <strong>{dnsGuideDomain}</strong> using these records:
              </p>
              {(dnsRecords.length > 0 ? dnsRecords : defaultDnsRecords).map((record, index) => (
                <div key={`${record.type}-${record.host}-${index}`} style={styles.dnsRow}>
                  <code style={styles.dnsCode}>Type: {record.type}</code>
                  <code style={styles.dnsCode}>Host: {record.host}</code>
                  <code style={styles.dnsCode}>Value: {record.value}</code>
                  <button style={styles.dnsCopyButton} onClick={() => handleCopyDnsValue(`${record.type} record`, record.value)}>
                    Copy
                  </button>
                </div>
              ))}
              <button style={styles.dnsCopyAllButton} onClick={handleCopyAllDnsRecords}>
                Copy all DNS records
              </button>
              {dnsCopyMessage ? <p style={styles.dnsCopyMessage}>{dnsCopyMessage}</p> : null}
            </div>
          ) : null}
        </section>
      ) : null}
      <section style={styles.marketCard}>
        <div style={styles.marketHeader}>
          <h3 style={styles.marketTitle}>Marketplace Ecosystem</h3>
          <span style={styles.ecosystemMeta}>{Object.keys(installedAddons).length} installed</span>
        </div>
        <p style={styles.ecosystemIntro}>
          Install ready add-ons or publish your own modules for booking, CRM, and automation workflows.
        </p>
        <div style={styles.marketControls}>
          <input
            style={styles.marketInput}
            placeholder="Search add-ons"
            value={addonSearch}
            onChange={(event) => setAddonSearch(event.target.value)}
          />
          <select style={styles.marketSortSelect} value={addonCategory} onChange={(event) => setAddonCategory(event.target.value)}>
            <option value="all">All categories</option>
            <option value="booking">Booking</option>
            <option value="crm">CRM</option>
            <option value="automation">Automation</option>
          </select>
        </div>
        <div style={styles.marketGrid}>
          {getFilteredAddons().map((addon) => {
            const installed = Boolean(installedAddons[addon.id]);
            return (
              <article key={addon.id} style={styles.marketItem}>
                <div>
                  <strong>{addon.name}</strong>
                  <p style={styles.marketSub}>
                    {(addon.category || "automation").toUpperCase()} • {addon.priceLabel || "Free"}
                  </p>
                  <p style={styles.ecosystemDescription}>{addon.description}</p>
                </div>
                <div style={styles.marketActions}>
                  {!installed ? (
                    <button style={styles.marketBuyButton} onClick={() => handleInstallAddon(addon)}>
                      Install
                    </button>
                  ) : (
                    <button style={styles.marketGhostButton} onClick={() => handleUninstallAddon(addon)}>
                      Uninstall
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
        <div style={styles.ecosystemPublisher}>
          <h4 style={styles.dnsTitle}>Developer Add-on Publisher</h4>
          <div style={styles.marketControls}>
            <input
              style={styles.marketInput}
              placeholder="Add-on name"
              value={addonNameInput}
              onChange={(event) => setAddonNameInput(event.target.value)}
            />
            <select style={styles.marketSortSelect} value={addonTypeInput} onChange={(event) => setAddonTypeInput(event.target.value)}>
              <option value="booking">Booking plugin</option>
              <option value="crm">CRM tool</option>
              <option value="automation">Automation tool</option>
            </select>
            <input
              style={styles.marketSortSelect}
              placeholder="Price label"
              value={addonPriceInput}
              onChange={(event) => setAddonPriceInput(event.target.value)}
            />
          </div>
          <div style={styles.marketControls}>
            <input
              style={styles.marketInput}
              placeholder="Supported pages (comma separated, e.g. booking.html,crm.html)"
              value={addonFeaturesInput}
              onChange={(event) => setAddonFeaturesInput(event.target.value)}
            />
          </div>
          <textarea
            style={styles.ecosystemTextarea}
            placeholder="Add-on description"
            value={addonDescriptionInput}
            onChange={(event) => setAddonDescriptionInput(event.target.value)}
          />
          <button style={styles.marketSearchButton} onClick={handlePublishAddon}>
            Publish Add-on
          </button>
        </div>
      </section>
    </>
  );
}
