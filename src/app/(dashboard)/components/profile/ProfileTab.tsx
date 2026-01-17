"use client";
interface User {
    id: string;
    email: string;
    role: string;
}

interface ProfileTabProps {
    user: User;
}

export default function ProfileTab({ user }: ProfileTabProps) {
    const displayName = user.email.split("@")[0];

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Profile Information</h2>

            {/* Profile Card */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">
                                {user.role}
                            </p>
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                {displayName.charAt(0).toUpperCase() +
                                    displayName.slice(1)}
                            </h2>
                            <p className="text-gray-600">{user.email}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {/* Email */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                    </label>
                    <div className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-600">
                        {user.email}
                    </div>
                </div>

                {/* Username (derived from email) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Username
                    </label>
                    <div className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-600">
                        {displayName}
                    </div>
                </div>

                {/* Role */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Role
                    </label>
                    <div className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-cyan-100 text-cyan-800">
                            {user.role}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
