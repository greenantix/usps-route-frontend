"use client"

import React, { useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDropzone } from 'react-dropzone';
import { Search, Upload, Edit, Trash2, Download, Plus } from 'lucide-react';
import Tesseract from 'tesseract.js';

// Define what a route stop looks like
interface RouteStop {
    seq: string;          // Sequence number
    address: string;      // Primary address
    streetName: string;   // Street name
    unit: string;         // APT number
    type: string;         // CURB R
    notes: string;        // For carrier notes
    additionalInfo?: string; // Names/info from right column
}

// Function to process the route image
const processRouteImage = async (imageFile: File, setProcessingStatus: React.Dispatch<React.SetStateAction<string>>): Promise<RouteStop[]> => {
    try {
        // Update status
        setProcessingStatus('Reading image...');

        // Use Tesseract to read the image
        const result = await Tesseract.recognize(
            imageFile,
            'eng',
            {
                logger: m => {
                    console.log('OCR Status:', m);
                    setProcessingStatus(m.status);
                }
            }
        );

        // Split the text into lines
        const lines = result.data.text
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);

        const routeStops: RouteStop[] = [];
        let currentStreet = '';

        // Process each line
        for (const line of lines) {
            // Skip header lines
            if (line.includes('SEQ') || line.includes('BUNDLE TYPE')) {
                continue;
            }

            // Try to match a sequence number at the start of the line
            const seqMatch = line.match(/^(\d+)/);
            if (seqMatch) {
                const seq = seqMatch[1];
                const remainingText = line.slice(seq.length).trim();

                // Initialize values
                let address = '';
                let streetName = '';
                let unit = '';
                const type = 'CURB R';
                let additionalInfo = '';

                // Try to extract street name
                if (remainingText.includes('DR') || remainingText.includes('RD') || remainingText.includes('ST')) {
                    const streetMatch = remainingText.match(/([A-Za-z\s]+(?:DR|RD|ST))/i);
                    if (streetMatch) {
                        streetName = streetMatch[1].trim();
                        currentStreet = streetName;
                    }
                }

                // Extract APT unit
                const unitMatch = remainingText.match(/APT\s*\d+/i);
                if (unitMatch) {
                    unit = unitMatch[0];
                }

                // Extract address number
                const addressMatch = remainingText.match(/^\d+/);
                if (addressMatch) {
                    address = addressMatch[0];
                }

                // Extract additional info (names from right column)
                const additionalMatch = remainingText.match(/\d{4}\s+(.+)$/);
                if (additionalMatch) {
                    additionalInfo = additionalMatch[1].trim();
                }

                routeStops.push({
                    seq,
                    address,
                    streetName: streetName || currentStreet,
                    unit,
                    type,
                    notes: '',
                    additionalInfo
                });
            }
        }

        return routeStops;

    } catch (error) {
        console.error('Error processing image:', error);
        throw error;
    }
};

// Main component
export default function RouteManagement() {
    // State management
    const [routeData, setRouteData] = useState<RouteStop[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [processing, setProcessing] = useState(false);
    const [processingStatus, setProcessingStatus] = useState<string>("");
    const [editMode, setEditMode] = useState(false);

    // Handle file upload
    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        setProcessing(true);
        try {
            for (const file of acceptedFiles) {
                console.log('Processing file:', file.name);
                const extractedData = await processRouteImage(file, setProcessingStatus);

                if (extractedData.length > 0) {
                    setRouteData(prevData => [...prevData, ...extractedData]);
                } else {
                    alert('No route data could be found in the image. Please try another image.');
                }
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error processing the image. Please try again.');
        } finally {
            setProcessing(false);
            setProcessingStatus("");
        }
    }, []);

    // Setup dropzone
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png'] // Accept only images
        }
    });

    // Handle adding new stop manually
    const handleAddStop = () => {
        setRouteData([...routeData, {
            seq: String(routeData.length + 1),
            address: "",
            streetName: "",
            unit: "",
            type: "CURB R",
            notes: ""
        }]);
    };

    // Handle deleting a stop
    const handleDeleteStop = (seq: string) => {
        setRouteData(routeData.filter(stop => stop.seq !== seq));
    };

    // Handle updating a stop
    const handleUpdateStop = (seq: string, field: keyof RouteStop, value: string) => {
        setRouteData(routeData.map(stop =>
            stop.seq === seq ? { ...stop, [field]: value } : stop
        ));
    };

    // Handle exporting to CSV
    const handleExportData = () => {
        const csvContent = "data:text/csv;charset=utf-8," +
            "Seq,Address,Street Name,Unit,Type,Notes,Additional Info\n" +
            routeData.map(row =>
                `${row.seq},${row.address},${row.streetName},${row.unit},${row.type},${row.notes},${row.additionalInfo || ''}`
            ).join("\n");

        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", "route_data.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Filter data for search
    const filteredData = routeData.filter(stop =>
        Object.values(stop).some(value =>
            value?.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    return (
        <div className="space-y-4">
            <Card className="mb-4">
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        <span>Route Editor</span>
                        <div className="space-x-2">
                            <Button
                                variant="outline"
                                onClick={() => setEditMode(!editMode)}
                            >
                                <Edit className="h-4 w-4 mr-2" />
                                {editMode ? 'View Mode' : 'Edit Mode'}
                            </Button>
                            {routeData.length > 0 && (
                                <Button
                                    variant="outline"
                                    onClick={handleExportData}
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Export to CSV
                                </Button>
                            )}
                        </div>
                    </CardTitle>
                </CardHeader>
            </Card>

            <Tabs defaultValue="upload">
                <TabsList>
                    <TabsTrigger value="upload">Upload Route</TabsTrigger>
                    <TabsTrigger value="view">View Route</TabsTrigger>
                </TabsList>

                <TabsContent value="upload">
                    <Card>
                        <CardContent className="space-y-4 pt-4">
                            <div
                                {...getRootProps()}
                                className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
                  ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'}`}
                            >
                                <input {...getInputProps()} />
                                <div className="space-y-2">
                                    <Upload className="h-10 w-10 mx-auto text-gray-500" />
                                    <h3 className="text-lg font-semibold">
                                        {isDragActive ? 'Drop the image here' : 'Upload Route Edit Book Image'}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        Take a clear photo of your route edit book and upload it here
                                    </p>
                                </div>
                            </div>
                            {processing && (
                                <Alert>
                                    <AlertDescription>
                                        <div className="space-y-2">
                                            <p>Processing image... Please wait.</p>
                                            {processingStatus && (
                                                <p className="text-sm text-gray-500">{processingStatus}</p>
                                            )}
                                        </div>
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="view">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Route Details</CardTitle>
                                <div className="flex space-x-2">
                                    <div className="relative">
                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                                        <Input
                                            className="pl-8 w-64"
                                            placeholder="Search..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    {editMode && (
                                        <Button onClick={handleAddStop}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Stop
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {routeData.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Seq #</TableHead>
                                            <TableHead>Address</TableHead>
                                            <TableHead>Street Name</TableHead>
                                            <TableHead>Unit</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Additional Info</TableHead>
                                            <TableHead>Notes</TableHead>
                                            {editMode && <TableHead>Actions</TableHead>}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredData.map((stop) => (
                                            <TableRow key={stop.seq}>
                                                <TableCell>{stop.seq}</TableCell>
                                                <TableCell>
                                                    {editMode ? (
                                                        <Input
                                                            value={stop.address}
                                                            onChange={(e) => handleUpdateStop(stop.seq, 'address', e.target.value)}
                                                        />
                                                    ) : stop.address}
                                                </TableCell>
                                                <TableCell>
                                                    {editMode ? (
                                                        <Input
                                                            value={stop.streetName}
                                                            onChange={(e) => handleUpdateStop(stop.seq, 'streetName', e.target.value)}
                                                        />
                                                    ) : stop.streetName}
                                                </TableCell>
                                                <TableCell>
                                                    {editMode ? (
                                                        <Input
                                                            value={stop.unit}
                                                            onChange={(e) => handleUpdateStop(stop.seq, 'unit', e.target.value)}
                                                        />
                                                    ) : stop.unit}
                                                </TableCell>
                                                <TableCell>
                                                    {editMode ? (
                                                        <Input
                                                            value={stop.type}
                                                            onChange={(e) => handleUpdateStop(stop.seq, 'type', e.target.value)}
                                                        />
                                                    ) : stop.type}
                                                </TableCell>
                                                <TableCell>{stop.additionalInfo}</TableCell>
                                                <TableCell>
                                                    <Input
                                                        placeholder="Add note..."
                                                        value={stop.notes}
                                                        onChange={(e) => handleUpdateStop(stop.seq, 'notes', e.target.value)}
                                                    />
                                                </TableCell>
                                                {editMode && (
                                                    <TableCell>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => handleDeleteStop(stop.seq)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    No route data available. Upload an image to get started.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}