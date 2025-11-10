"use client";

import { useState, useEffect } from "react";
import { API_BASE } from "@/lib/constants";
import AvatarImage from "../AvatarImage";
import { Plus, X } from "lucide-react";
import toast from "react-hot-toast";

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

interface CurrentUser {
    role: string;
}

interface RoleTabProps {
    user: CurrentUser;
}

export default function RoleTab({ user }: RoleTabProps) {
    const [employees, setEmployees] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form state for adding new employee
    const [newEmployee, setNewEmployee] = useState({
        name: "",
        email: "",
        password: "",
        role: "EMPLOYEE",
    });

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");

            const res = await fetch(`${API_BASE}/users/employees`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error("Failed to fetch employees");

            const data = await res.json();
            if (data.success) {
                setEmployees(data.data);
            }
        } catch (error) {
            console.error("❌ Error fetching employees:", error);
            toast.error("Failed to load employees");
        } finally {
            setLoading(false);
        }
    };

    const handleAddEmployee = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        const loadingToast = toast.loading("Adding employee...");

        try {
            const token = localStorage.getItem("token");

            const res = await fetch(`${API_BASE}/users/employees`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(newEmployee),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to add employee");
            }

            if (data.success) {
                toast.success("Employee added successfully!", { id: loadingToast });
                setShowAddModal(false);
                setNewEmployee({ name: "", email: "", password: "", role: "EMPLOYEE" });
                fetchEmployees();
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error("❌ Error adding employee:", error);
            toast.error(error.message || "Failed to add employee", { id: loadingToast });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteEmployee = async (userId: string, employeeName: string) => {
        if (!confirm(`Are you sure you want to delete ${employeeName}?`)) return;

        const loadingToast = toast.loading("Deleting employee...");

        try {
            const token = localStorage.getItem("token");

            const res = await fetch(`${API_BASE}/users/employees/${userId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error("Failed to delete employee");

            const data = await res.json();
            if (data.success) {
                toast.success("Employee deleted successfully!", { id: loadingToast });
                fetchEmployees();
            }
        } catch (error) {
            console.error("❌ Error deleting employee:", error);
            toast.error("Failed to delete employee", { id: loadingToast });
        }
    };

    // Check if current user is ADMIN
    if (user.role !== "ADMIN") {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">You don`t have permission to access this page.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-studio"></div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold">Employee List</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage your employees</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-6 py-3 border border-primary-studio text-primary-studio rounded-lg hover:bg-cyan-50 transition-colors"
                >
                    <Plus size={20} />
                    Add Employee
                </button>
            </div>

            {/* Employee List */}
            {employees.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No employees found. Add your first employee!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {employees.map((employee) => (
                        <div
                            key={employee.id}
                            className="flex items-center justify-between p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center gap-4">
                                <AvatarImage src={null} username={employee.name} size={48} />
                                <div>
                                    <h3 className="font-semibold text-lg">{employee.name}</h3>
                                    <p className="text-sm text-gray-500">{employee.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="px-4 py-2 rounded-lg font-medium bg-primary-studio/10 text-primary-studio">
                                    Employee
                                </span>

                                <button
                                    onClick={() => handleDeleteEmployee(employee.id, employee.name)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete employee"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Employee Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-6">Add Employee</h2>

                        <form onSubmit={handleAddEmployee} className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium mb-4">Input Employee Information</h3>

                                <div className="space-y-4">
                                    {/* Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="John Doe"
                                            value={newEmployee.name}
                                            onChange={(e) =>
                                                setNewEmployee({ ...newEmployee, name: e.target.value })
                                            }
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-studio focus:border-transparent"
                                            required
                                            disabled={submitting}
                                        />
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            placeholder="john@example.com"
                                            value={newEmployee.email}
                                            onChange={(e) =>
                                                setNewEmployee({ ...newEmployee, email: e.target.value })
                                            }
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-studio focus:border-transparent"
                                            required
                                            disabled={submitting}
                                        />
                                    </div>

                                    {/* Password */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Password *
                                        </label>
                                        <input
                                            type="password"
                                            placeholder="Minimum 6 characters"
                                            value={newEmployee.password}
                                            onChange={(e) =>
                                                setNewEmployee({ ...newEmployee, password: e.target.value })
                                            }
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-studio focus:border-transparent"
                                            required
                                            minLength={6}
                                            disabled={submitting}
                                        />
                                    </div>

                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setNewEmployee({ name: "", email: "", password: "", role: "EMPLOYEE" });
                                    }}
                                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-primary-studio text-white rounded-lg hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={submitting}
                                >
                                    {submitting ? "Adding..." : "Add Employee"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}