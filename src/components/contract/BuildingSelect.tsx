"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

export interface BuildingOption {
  id: string;
  name: string;
}

interface BuildingSelectProps {
  value: string;
  onChange: (buildingId: string) => void;
  buildings: BuildingOption[];
  loading: boolean;
  onCreated: (building: BuildingOption) => void;
}

export default function BuildingSelect({ value, onChange, buildings, loading, onCreated }: BuildingSelectProps) {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate() {
    if (!newName.trim()) {
      toast.error("Vui lòng nhập tên nhà/căn hộ");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/buildings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || "Không thể tạo nhà/căn hộ");
        return;
      }
      onCreated({ id: result.building.id, name: result.building.name });
      setNewName("");
      setCreating(false);
      toast.success("Đã tạo nhà/căn hộ mới");
    } catch {
      toast.error("Không thể kết nối đến máy chủ");
    } finally {
      setSubmitting(false);
    }
  }

  if (creating) {
    return (
      <div className="flex gap-2">
        <input
          autoFocus
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleCreate())}
          placeholder="Tên nhà/căn hộ mới"
          className="input flex-1 pl-10"
        />
        <button type="button" onClick={handleCreate} disabled={submitting} className="btn-primary shrink-0 text-sm">
          {submitting ? <Loader2 size={15} className="animate-spin" /> : "Lưu"}
        </button>
        <button type="button" onClick={() => setCreating(false)} className="btn-secondary shrink-0 text-sm">
          Hủy
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <select
        value={value}
        onChange={(e) => {
          if (e.target.value === "__new__") {
            setCreating(true);
            return;
          }
          onChange(e.target.value);
        }}
        disabled={loading}
        className="input pl-10"
      >
        <option value="">Không thuộc nhà nào</option>
        {buildings.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
        <option value="__new__">+ Tạo nhà mới...</option>
      </select>
    </div>
  );
}
