"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";

interface TableEditorProps {
  content: any;
  onChange: (content: any) => void;
}

export function TableEditor({ content, onChange }: TableEditorProps) {
  const tableData = content.data || [["", ""]];
  
  const addRow = () => {
    const newRow = Array(tableData[0]?.length || 2).fill("");
    onChange({ ...content, data: [...tableData, newRow] });
  };
  
  const addColumn = () => {
    const newData = tableData.map((row: string[]) => [...row, ""]);
    onChange({ ...content, data: newData });
  };
  
  const deleteRow = (rowIndex: number) => {
    if (tableData.length <= 1) return; // Keep at least one row
    const newData = tableData.filter((_: any, i: number) => i !== rowIndex);
    onChange({ ...content, data: newData });
  };
  
  const deleteColumn = (colIndex: number) => {
    if (tableData[0]?.length <= 1) return; // Keep at least one column
    const newData = tableData.map((row: string[]) => 
      row.filter((_, i) => i !== colIndex)
    );
    onChange({ ...content, data: newData });
  };
  
  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const newData = tableData.map((row: string[], rIdx: number) => 
      rIdx === rowIndex 
        ? row.map((cell, cIdx) => cIdx === colIndex ? value : cell)
        : row
    );
    onChange({ ...content, data: newData });
  };
  
  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-gray-500">Table</label>
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            {/* Column delete buttons header */}
            <thead>
              <tr>
                {tableData[0]?.map((_: any, colIndex: number) => (
                  <th key={colIndex} className="border border-gray-300 bg-gray-50 p-1">
                    <button
                      onClick={() => deleteColumn(colIndex)}
                      className="w-full text-gray-400 hover:text-red-500 transition-colors p-1"
                      title="Delete column"
                    >
                      <Trash2 className="h-4 w-4 mx-auto" />
                    </button>
                  </th>
                )) || []}
                <th className="border-0 bg-transparent w-10"></th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row: string[], rowIndex: number) => (
                <tr key={rowIndex}>
                  {row.map((cell, colIndex) => (
                    <td key={colIndex} className="border border-gray-300 p-0">
                      <Input
                        value={cell}
                        onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                        className="border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 min-w-[150px]"
                        placeholder={`Cell ${rowIndex + 1},${colIndex + 1}`}
                      />
                    </td>
                  ))}
                  {/* Row delete button */}
                  <td className="border-0 pl-2 text-center">
                    <button
                      onClick={() => deleteRow(rowIndex)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete row"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={addRow}
            className="text-sm"
          >
            + Row
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={addColumn}
            className="text-sm"
          >
            + Column
          </Button>
        </div>
      </div>
    </div>
  );
}
