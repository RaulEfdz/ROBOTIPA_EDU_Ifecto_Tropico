"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Wrench } from "lucide-react";

export type StorageReport = {
  fileCount: number;
  totalSizeMB: number;
  totalSizeBytes: number;
  smallestFile?: {
    name: string;
    size: number;
  };
  duplicateNames: Record<string, number>;
};

export function StorageDetails({
  report,
  onRefresh,
}: {
  report: StorageReport;
  onRefresh?: () => void;
}) {
  const { fileCount, totalSizeMB, smallestFile, duplicateNames } = report;
  const percentage = Math.min((totalSizeMB / 2048) * 100, 100);

  return (
    <div className="mt-6 mx-4 p-6 border rounded-lg bg-TextCustom shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          Detalles de almacenamiento
        </h2>
        {onRefresh && (
          <Button size="sm" onClick={onRefresh} variant="outline">
            Refrescar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
        <p>
          <strong>📄 Archivos totales:</strong> {fileCount}
        </p>
        <p>
          <strong>💾 Almacenamiento total:</strong> {totalSizeMB} MB
        </p>
        {smallestFile && (
          <p className="col-span-full">
            <strong>📎 Archivo más pequeño:</strong> {smallestFile.name} (
            {smallestFile.size} bytes)
          </p>
        )}
      </div>

      <div className="mt-6">
        <h3 className="text-md font-medium text-gray-800 mb-2">
          Duplicados por nombre
        </h3>
        <ul className="divide-y divide-gray-200 rounded-md border border-gray-200 bg-gray-50">
          {Object.entries(duplicateNames).map(([name, count]) => (
            <li
              key={name}
              className="flex items-center justify-between px-4 py-2"
            >
              <span className="text-gray-700 truncate text-sm">
                {name} ({count} veces)
              </span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-700"
                  title="Eliminar duplicados"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-primary-500 hover:text-primary-700"
                  title="Corregir nombre"
                >
                  <Wrench className="w-4 h-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6">
        <p className="text-sm text-gray-700 mb-1">
          <strong>📊 Uso de almacenamiento:</strong> {totalSizeMB} MB de 2048 MB
          ({percentage.toFixed(2)}%)
        </p>
        <div className="w-full bg-gray-200 rounded h-4">
          <div
            style={{ width: `${percentage}%` }}
            className={`h-4 rounded ${percentage > 90 ? "bg-red-500" : "bg-primary-500"}`}
          ></div>
        </div>
      </div>
    </div>
  );
}
