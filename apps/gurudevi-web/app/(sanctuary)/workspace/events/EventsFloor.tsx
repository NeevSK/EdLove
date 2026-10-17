'use client';

import type { InstitutionalEvent, InventoryAssetItem } from '@repo/core/types/InstitutionalERP';
import React, { useEffect, useState } from 'react';
import {
  DEFAULT_CANONICAL_EVENTS,
  DEFAULT_CANONICAL_INVENTORY,
  erpHexagonalService,
} from '@/lib/domain/adapters/erp/erpHexagonalService';
import styles from './events.module.css';

interface EventsFloorProps {
  schoolId?: string;
}

export function EventsFloor({ schoolId = 'school-ananda-colombo' }: Readonly<EventsFloorProps>) {
  const [events, setEvents] = useState<InstitutionalEvent[]>(DEFAULT_CANONICAL_EVENTS);
  const [inventory, setInventory] = useState<InventoryAssetItem[]>(DEFAULT_CANONICAL_INVENTORY);
  const [filter, setFilter] = useState<'all' | 'nutrition' | 'excursion' | 'sports'>('all');
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const evts = await erpHexagonalService.getInstitutionalEvents(schoolId);
        const inv = await erpHexagonalService.getInventoryItems(schoolId);
        setEvents(evts);
        setInventory(inv);
      } catch {
        // Fall back to canonical defaults
      }
    }
    loadData();
  }, [schoolId]);

  const filteredEvents = events.filter((e) => {
    if (filter === 'all') return true;
    return e.category === filter;
  });

  const totalBudgetCents = events.reduce((sum, e) => sum + e.estimatedBudgetCents, 0);
  const lowStockCount = inventory.filter(
    (i) => i.nature === 'consumable_stock' && i.totalQuantity <= (i.reorderThreshold ?? 0),
  ).length;

  const handleQuickDispatch = async (item: InventoryAssetItem) => {
    try {
      const dispatchQty = item.category === 'nutrition_pantry' ? 10 : 1;
      const res = await erpHexagonalService.dispatchStock(item, dispatchQty, {
        eventId: 'evt-midday-meal-daily',
        performedByUserId: 'usr-current-operator',
        unitCostCents: 24000,
        reason: 'Daily routine dispatch for Midday Nutrition Program',
      });

      const updatedInv = await erpHexagonalService.getInventoryItems(schoolId);
      setInventory(updatedInv);

      setNotice(
        `Dispatched ${dispatchQty} ${item.unitOfMeasure ?? 'units'} of ${item.name}. New balance: ${res.updatedItem.totalQuantity}.`,
      );
      setTimeout(() => setNotice(null), 4000);
    } catch (err: any) {
      setNotice(err.message || 'Dispatch failed.');
      setTimeout(() => setNotice(null), 4000);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1>Institutional Programs, Events & Inventory ERP</h1>
          <p className={styles.subtitle}>
            Multi-scope governance for statutory nutrition feeding, co-curricular events, and
            physical assets.
          </p>
        </div>
      </header>

      {notice && <div className={styles.bannerNotice}>{notice}</div>}

      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Active Programs & Events</span>
          <span className={styles.kpiValue}>{events.length}</span>
          <span className={styles.kpiSub}>Daily Midday Feeding Active</span>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Total Program Budgets</span>
          <span className={styles.kpiValue}>
            Rs. {(totalBudgetCents / 100).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
          </span>
          <span className={styles.kpiSub}>100% Balanced Subsidies</span>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Inventory Items Monitored</span>
          <span className={styles.kpiValue}>{inventory.length}</span>
          <span className={styles.kpiSub}>Durables + Pantry Stocks</span>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Stock Low-Water Alerts</span>
          <span
            className={styles.kpiValue}
            style={{ color: lowStockCount > 0 ? '#ef4444' : '#10b981' }}
          >
            {lowStockCount}
          </span>
          <span className={styles.kpiSub}>
            {lowStockCount > 0 ? 'Reorder Needed' : 'Healthy Pantry'}
          </span>
        </div>
      </div>

      <nav className={styles.tabBar} aria-label="Event Categories">
        <button
          className={`${styles.tabBtn} ${filter === 'all' ? styles.activeTab : ''}`}
          onClick={() => setFilter('all')}
        >
          All Institutional Programs
        </button>
        <button
          className={`${styles.tabBtn} ${filter === 'nutrition' ? styles.activeTab : ''}`}
          onClick={() => setFilter('nutrition')}
        >
          Midday Nutrition
        </button>
        <button
          className={`${styles.tabBtn} ${filter === 'excursion' ? styles.activeTab : ''}`}
          onClick={() => setFilter('excursion')}
        >
          Educational Excursions
        </button>
        <button
          className={`${styles.tabBtn} ${filter === 'sports' ? styles.activeTab : ''}`}
          onClick={() => setFilter('sports')}
        >
          Athletics & Sports Meets
        </button>
      </nav>

      <div className={styles.contentGrid}>
        <section className={styles.eventsList}>
          {filteredEvents.map((event) => (
            <article key={event.id} className={styles.eventCard}>
              <div className={styles.eventTop}>
                <div>
                  <h2 className={styles.eventTitle}>{event.title}</h2>
                  <p className={styles.itemSub}>{event.description}</p>
                </div>
                <div className={styles.badgeGroup}>
                  <span className={`${styles.pill} ${styles.pillPrimary}`}>
                    {event.category.toUpperCase()}
                  </span>
                  <span
                    className={`${styles.pill} ${
                      event.status === 'in_progress' ? styles.pillSuccess : styles.pillWarning
                    }`}
                  >
                    {event.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>

              <div className={styles.eventMeta}>
                <span>
                  <strong>Cadence:</strong> {event.cadence.replace('_', ' ')}
                </span>
                <span>
                  <strong>Scope:</strong> {event.scopeType.toUpperCase()}
                </span>
                <span>
                  <strong>Funding:</strong> {event.fundingSource.replace('_', ' ')}
                </span>
                <span>
                  <strong>Budget:</strong> Rs.{' '}
                  {(event.estimatedBudgetCents / 100).toLocaleString('en-LK')}
                </span>
              </div>
            </article>
          ))}
        </section>

        <aside className={styles.inventoryDrawer}>
          <h2 className={styles.drawerTitle}>Physical Asset & Pantry Stocks</h2>
          <div className={styles.inventoryList}>
            {inventory.map((item) => (
              <div key={item.id} className={styles.inventoryRow}>
                <div className={styles.inventoryDetails}>
                  <span className={styles.itemName}>{item.name}</span>
                  <span className={styles.itemSub}>
                    {item.nature === 'consumable_stock' ? (
                      <>
                        Stock: {item.totalQuantity} {item.unitOfMeasure} (Threshold:{' '}
                        {item.reorderThreshold})
                      </>
                    ) : (
                      <>
                        Avail: {item.availableQuantity}/{item.totalQuantity} • Tag: {item.assetTag}
                      </>
                    )}
                  </span>
                  <span className={styles.itemSub}>Location: {item.storageLocation}</span>
                </div>
                {item.nature === 'consumable_stock' && (
                  <button className={styles.actionBtn} onClick={() => handleQuickDispatch(item)}>
                    Dispatch
                  </button>
                )}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
