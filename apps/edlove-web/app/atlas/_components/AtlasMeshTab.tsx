'use client';

import Link from 'next/link';
import React from 'react';
import type { SchoolItem } from '../_types/atlas.types';

export interface AtlasMeshTabProps {
  stats: { total_schools: number; total_resources: number; total_connections: number } | null;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  selectedType: string;
  setSelectedType: (t: string) => void;
  selectedDistrict: string;
  setSelectedDistrict: (d: string) => void;
  schools: SchoolItem[];
  schoolsCount: number;
  loading: boolean;
}

export function AtlasMeshTab({
  stats,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedType,
  setSelectedType,
  selectedDistrict,
  setSelectedDistrict,
  schools,
  schoolsCount,
  loading,
}: AtlasMeshTabProps) {
  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="bg-[#fffefb] border border-[#e5dec9] p-5 rounded-2xl shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label
              htmlFor="school-search-input"
              className="block text-xs font-semibold text-[#73685e] uppercase tracking-wider mb-1"
            >
              Search Schools (Name, Town, or Census No)
            </label>
            <input
              id="school-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. Royal College, Laxapana, Ananda, 0117001..."
              className="w-full px-4 py-2.5 rounded-xl border border-[#d6cbba] bg-[#faf8f5] focus:outline-hidden focus:ring-2 focus:ring-[#a85022] text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="category-select"
              className="block text-xs font-semibold text-[#73685e] uppercase tracking-wider mb-1"
            >
              Category
            </label>
            <select
              id="category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[#d6cbba] bg-[#faf8f5] focus:outline-hidden focus:ring-2 focus:ring-[#a85022] text-sm"
            >
              <option value="">All Categories</option>
              <option value="National">National Schools (373)</option>
              <option value="Provincial">Provincial Schools (9,782)</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="type-select"
              className="block text-xs font-semibold text-[#73685e] uppercase tracking-wider mb-1"
            >
              School Type
            </label>
            <select
              id="type-select"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[#d6cbba] bg-[#faf8f5] focus:outline-hidden focus:ring-2 focus:ring-[#a85022] text-sm"
            >
              <option value="">All Types</option>
              <option value="1AB">Type 1AB (A/L Science)</option>
              <option value="1C">Type 1C (A/L Arts/Comm)</option>
              <option value="Type 2">Type 2 (Up to O/L)</option>
              <option value="Type 3">Type 3 (Primary Grade 1-5)</option>
            </select>
          </div>
        </div>

        {/* Status Note */}
        <div className="mt-4 pt-4 border-t border-[#f0e7d8] flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#73685e] gap-2">
          <div>
            Showing <span className="font-semibold text-[#1a1714]">{schools.length}</span> results{' '}
            {schoolsCount > 0 ? `(matched ${schoolsCount})` : ''}
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#e8a342]"></span> Tentative Centroid
              (Survey/Postal)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#246342]"></span> Ground-Truthed GPS
              Ping
            </span>
          </div>
        </div>
      </div>

      {/* School Cards Grid */}
      {loading ? (
        <div className="text-center py-16 text-[#73685e]">
          <div className="inline-block animate-spin w-6 h-6 border-2 border-[#a85022] border-t-transparent rounded-full mb-3"></div>
          <div>Querying spatial index...</div>
        </div>
      ) : schools.length === 0 ? (
        <div className="text-center py-16 bg-[#fffefb] border border-[#e5dec9] rounded-2xl p-8">
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="text-lg font-bold text-[#1a1714]">No schools found</h3>
          <p className="text-sm text-[#73685e] mt-1">
            Try refining your search keyword or clearing the filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schools.map((s) => (
            <Link
              key={s.census_no}
              href={`/atlas/school/${s.census_no}`}
              className="group bg-[#fffefb] border border-[#e5dec9] hover:border-[#a85022] p-5 rounded-2xl transition-all hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-mono text-xs text-[#824112] bg-[#fbf0e8] px-2 py-0.5 rounded-md font-semibold">
                    {s.census_no}
                  </span>
                  <div className="flex gap-1.5">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        s.category === 'National'
                          ? 'bg-[#eaf1fb] text-[#1a3e6a] border border-[#cdddf2]'
                          : 'bg-[#f4efe6] text-[#615951] border border-[#e2d8c7]'
                      }`}
                    >
                      {s.category}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#fdf5ea] text-[#915809] border border-[#f5e3c2]">
                      {s.type}
                    </span>
                  </div>
                </div>

                <h3 className="font-serif font-bold text-base text-[#1a1714] group-hover:text-[#a85022] transition-colors line-clamp-1">
                  {s.name}
                </h3>

                {(s.name_si || s.name_ta) && (
                  <p className="text-xs text-[#73685e] mt-0.5 font-sans line-clamp-1">
                    {s.name_si || s.name_ta}
                  </p>
                )}

                <div className="mt-3 flex items-center gap-2 text-xs text-[#73685e]">
                  <span>📍 {s.district_name || 'District'}</span>
                  <span>•</span>
                  <span>{s.province_name || 'Province'}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#f0e7d8] flex items-center justify-between text-xs">
                <div className="font-mono">
                  <span className="font-bold text-[#1a1714]">
                    {s.total_students?.toLocaleString() || 0}
                  </span>{' '}
                  students
                </div>
                <div className="flex items-center gap-1.5 text-[#a85022] font-medium group-hover:translate-x-1 transition-transform">
                  <span>View Dossier</span>
                  <span>→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
