import { useState, useMemo, useCallback } from "react";
import { ArrowUpDown, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CarData } from "../types";
import { useEffect } from "react";

interface DataTableProps {
  data: CarData[];
  itemsPerPage?: number;
}

type SortConfig = {
  key: keyof CarData;
  direction: "asc" | "desc";
} | null;

// Debounce function
function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Function to create a search index for faster lookups
const createSearchIndex = (item: CarData): string => {
  return Object.values(item)
    .filter(Boolean)
    .map((value) => String(value).toLowerCase())
    .join(" ");
};

export const DataTable = ({
  data,
  initialItemsPerPage = 10,
}: DataTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<Partial<CarData>>({});
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Create search index for each item once
  const searchIndex = useMemo(() => {
    return data.map((item) => ({
      ...item,
      searchIndex: createSearchIndex(item),
    }));
  }, [data]);

  // Handle search term updates with debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.toLowerCase());
    }, 100); // 300ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Memoize the filtered data
  const processedData = useMemo(() => {
    let result = searchIndex;

    // Apply search term using the pre-computed search index
    if (debouncedSearchTerm) {
      result = result.filter((item) =>
        item.searchIndex.includes(debouncedSearchTerm)
      );
    }

    // Apply filters
    if (Object.keys(filters).length > 0) {
      result = result.filter((item) =>
        Object.entries(filters).every(([key, value]) => {
          if (!value) return true;
          return String(item[key as keyof CarData]) === String(value);
        })
      );
    }

    // Apply sorting
    if (sortConfig) {
      result.sort((a, b) => {
        const aVal = String(a[sortConfig.key]);
        const bVal = String(b[sortConfig.key]);
        return sortConfig.direction === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      });
    }

    return result;
  }, [searchIndex, debouncedSearchTerm, filters, sortConfig]);

  // Get unique values for dropdown filters - memoized
  const getUniqueValues = useCallback(
    (key: keyof CarData) => {
      const uniqueSet = new Set<string>();
      for (const item of data) {
        const value = item[key];
        if (value) uniqueSet.add(String(value));
      }
      return Array.from(uniqueSet).sort();
    },
    [data]
  );

  const totalPages = Math.ceil(processedData.length / itemsPerPage);
  const paginatedData = processedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (key: keyof CarData) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        if (current.direction === "asc") {
          return { key, direction: "desc" };
        }
        return null;
      }
      return { key, direction: "asc" };
    });
  };

  const renderColumnHeader = (key: keyof CarData, label: string) => {
    const uniqueValues = getUniqueValues(key);
    const hasLongList = uniqueValues.length > 8;

    return (
      <th className="px-4 py-2 font-medium text-left">
        <div className="flex items-center gap-1">
          <span>{label}</span>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => handleSort(key)}
            >
              <ArrowUpDown className="h-3 w-3" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Filter className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className={`w-48 bg-popover text-popover-foreground border border-border ${
                  hasLongList ? "max-h-60 overflow-y-auto" : ""
                }`}
              >
                {uniqueValues.map((value) => (
                  <DropdownMenuItem
                    key={String(value)}
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, [key]: value }))
                    }
                  >
                    {String(value)}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem
                  onClick={() => {
                    const newFilters = { ...filters };
                    delete newFilters[key];
                    setFilters(newFilters);
                  }}
                >
                  Clear filter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </th>
    );
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-4">
        <Input
          placeholder="Search all columns..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs bg-background text-foreground"
        />
        <div className="text-sm text-muted-foreground">
          Showing {processedData.length} of {data.length} entries
        </div>
      </div>

      <div className="border rounded-lg border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-foreground">
            <thead className="bg-muted">
              <tr className="text-left text-muted-foreground">
                {renderColumnHeader("VIN", "VIN")}
                {renderColumnHeader("County", "County")}
                {renderColumnHeader("City", "City")}
                {renderColumnHeader("State", "State")}
                {renderColumnHeader("PostalCode", "Postal Code")}
                {renderColumnHeader("ModelYear", "Year")}
                {renderColumnHeader("Make", "Make")}
                {renderColumnHeader("Model", "Model")}
                {renderColumnHeader("ElectricVehicleType", "Type")}
                {renderColumnHeader("Eligibility", "Eligibility")}
                {renderColumnHeader("ElectricRange", "Range")}
                {renderColumnHeader("MSRP", "MSRP")}
                {renderColumnHeader("LegislativeDistrict", "District")}
                {renderColumnHeader("DOLVehicleID", "DOL ID")}
                {renderColumnHeader("VehicleLocation", "Location")}
                {renderColumnHeader("ElectricUtility", "Utility")}
                {renderColumnHeader("CensusTract", "Census")}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((car, index) => (
                <tr
                  key={index}
                  className="border-t border-border hover:bg-muted/50"
                >
                  <td className="px-4 py-2 text-foreground">
                    {car.VIN?.slice(0, 10)}
                  </td>
                  <td className="px-4 py-2 text-foreground">{car.County}</td>
                  <td className="px-4 py-2 text-foreground">{car.City}</td>
                  <td className="px-4 py-2 text-foreground">{car.State}</td>
                  <td className="px-4 py-2 text-foreground">
                    {car.PostalCode}
                  </td>
                  <td className="px-4 py-2 text-foreground">{car.ModelYear}</td>
                  <td className="px-4 py-2 text-foreground">{car.Make}</td>
                  <td className="px-4 py-2 text-foreground">{car.Model}</td>
                  <td className="px-4 py-2 text-foreground">
                    {car.ElectricVehicleType}
                  </td>
                  <td className="px-4 py-2 text-foreground">
                    {car.Eligibility}
                  </td>
                  <td className="px-4 py-2 text-foreground">
                    {car.ElectricRange}
                  </td>
                  <td className="px-4 py-2 text-foreground">{car.MSRP}</td>
                  <td className="px-4 py-2 text-foreground">
                    {car.LegislativeDistrict}
                  </td>
                  <td className="px-4 py-2 text-foreground">
                    {car.DOLVehicleID}
                  </td>
                  <td className="px-4 py-2 text-foreground">
                    {car.VehicleLocation}
                  </td>
                  <td className="px-4 py-2 text-foreground">
                    {car.ElectricUtility}
                  </td>
                  <td className="px-4 py-2 text-foreground">
                    {car.CensusTract}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Items per page:</span>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => handleItemsPerPageChange(Number(value))}
          >
            <SelectTrigger className="w-20">
              <SelectValue>{itemsPerPage}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 15, 20, 25, 50].map((value) => (
                <SelectItem key={value} value={value.toString()}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
