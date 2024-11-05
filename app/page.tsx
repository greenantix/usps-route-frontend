"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollText, MapPin, Package, Clock, Menu } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const tools = [
    {
      title: "Route Management",
      description: "Upload and manage your route edit book efficiently. Convert physical route books into digital format.",
      icon: <ScrollText className="w-12 h-12 text-blue-600" />,
      link: "/route-management",
      status: "Available"
    },
    {
      title: "Package Tracker",
      description: "Track packages and manage delivery sequences for maximum efficiency.",
      icon: <Package className="w-12 h-12 text-gray-400" />,
      link: "#",
      status: "Coming Soon"
    },
    {
      title: "Time Calculator",
      description: "Calculate route times, breaks, and overtime with ease.",
      icon: <Clock className="w-12 h-12 text-gray-400" />,
      link: "#",
      status: "Coming Soon"
    },
    {
      title: "Address Lookup",
      description: "Quick address verification and location services.",
      icon: <MapPin className="w-12 h-12 text-gray-400" />,
      link: "#",
      status: "Coming Soon"
    }
  ];

  return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-blue-600 text-white shadow-lg">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Menu className="h-6 w-6" />
                <h1 className="text-xl font-bold">USPS Toolkit</h1>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {/* Hero Section */}
          <Card className="mb-8 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl text-center">
                Digital Tools for USPS Letter Carriers
              </CardTitle>
              <CardDescription className="text-blue-100 text-center">
                Streamline your daily routes and increase efficiency
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button
                  asChild
                  variant="secondary"
                  size="lg"
                  className="mt-4 font-semibold"
              >
                <Link href="/route-management">
                  Get Started with Route Management
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tools.map((tool) => (
                <Card
                    key={tool.title}
                    className={`transition-all duration-300 hover:shadow-lg ${
                        tool.status === "Coming Soon" ? "opacity-70" : "hover:-translate-y-1"
                    }`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      {tool.icon}
                      <span className={`text-sm px-3 py-1 rounded-full ${
                          tool.status === "Available"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                      }`}>
                    {tool.status}
                  </span>
                    </div>
                    <CardTitle className="text-xl mt-4">{tool.title}</CardTitle>
                    <CardDescription>{tool.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                        asChild
                        variant={tool.status === "Available" ? "default" : "secondary"}
                        className="w-full"
                        disabled={tool.status !== "Available"}
                    >
                      <Link href={tool.link}>
                        {tool.status === "Available" ? "Launch Tool" : "Coming Soon"}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
            ))}
          </div>

          {/* Footer */}
          <footer className="mt-12 text-center text-gray-500 text-sm">
            <p>USPS Toolkit - Digital Tools for Letter Carriers</p>
            <p className="mt-2">Not affiliated with the United States Postal Service</p>
          </footer>
        </main>
      </div>
  );
}