import { LogOut, Trash2, PauseCircle, X, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState } from "react";
import api from "../lib/axios";

export function ExitMenu({ isOpen, onClose, onLogout }) {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  // --- Actions ---
  const handleLogout = () => {
    // Run parent logout logic if provided
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem("authToken");
    }

    toast.success("See you next time!");
    navigate("/");
  };

  const handlePause = () => {
    toast.success("Account paused. You are now invisible.");
    onClose();
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure? This is permanent.")) return;
    setIsDeleting(true);
    try {
      // Adjust URL to match your backend port
      await api.delete("/api/user/delete");
      toast.success("Account deleted.");
      if (onLogout) onLogout();
      navigate("/");
    } catch (e) {
      console.error(e);
      toast.error("Error deleting account.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    // 1. Backdrop
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">

      {/* 2. The Card */}
      <div
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Header */}
        <div className="relative pt-8 pb-4 px-6 text-center">
          <div className="w-16 h-1 bg-slate-200 rounded-full mx-auto mb-6" />
          <h2 className="text-xl font-bold text-slate-800">Leaving so soon?</h2>
          <p className="text-sm text-slate-500 mt-1">Manage your account access below</p>

          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Menu Items */}
        <div className="px-4 pb-6 space-y-3">

          <MenuItem
            icon={<PauseCircle className="w-5 h-5 text-indigo-600" />}
            colorClass="bg-indigo-50"
            title="Pause Account"
            subtitle="Hide your profile temporarily"
            onClick={handlePause}
          />

          <MenuItem
            icon={<LogOut className="w-5 h-5 text-slate-700" />}
            colorClass="bg-slate-100"
            title="Log Out"
            subtitle="Sign out on this device"
            onClick={handleLogout}
          />

          <div className="h-px bg-slate-100 my-2 mx-2" />

          {/* Delete (Danger) */}
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-red-50 transition-all group text-left border border-transparent hover:border-red-100"
          >
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center shrink-0 group-hover:bg-red-100 transition-colors">
              {isDeleting ? (
                <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Trash2 className="w-5 h-5 text-red-500" />
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-red-600">Delete Account</h4>
              <p className="text-xs text-red-400">Permanently erase all data</p>
            </div>
          </button>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl font-semibold text-slate-600 hover:bg-white hover:shadow-sm hover:text-slate-900 transition-all border border-transparent hover:border-slate-200"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}

// --- Helper Component ---
function MenuItem({ icon, colorClass, title, subtitle, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all group text-left border border-transparent hover:border-slate-100"
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${colorClass} group-hover:scale-105 transition-transform`}>
        {icon}
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-slate-800">{title}</h4>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-400 group-hover:translate-x-1 transition-all" />
    </button>
  );
}