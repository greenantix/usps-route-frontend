"use client";

import RouteManagementPage from '@/components/RouteManagement';
import { Button } from "@/components/ui/button";
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function RoutePage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-blue-600 text-white shadow-lg">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-white hover:text-blue-100"
                            asChild
                        >
                            <Link href="/">
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Back to Toolkit
                            </Link>
                        </Button>
                        <h1 className="text-xl font-bold">Route Management</h1>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                <RouteManagementPage />
            </main>
        </div>
    );
}