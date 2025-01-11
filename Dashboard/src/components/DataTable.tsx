import { useState } from "react";
import { CarData } from "../types";

interface DataTableProps {
  data: CarData[];
  itemsPerPage?: number;
}

export const DataTable = ({ data, itemsPerPage = 10 }: DataTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<Partial<EVData>>({});

  const filteredData = data.filter((item) => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      const itemValue = item[key as keyof EVData];
      return String(itemValue)
        .toLowerCase()
        .includes(String(value).toLowerCase());
    });
  });

  const totalPages = Math.ceil(data.length / itemsPerPage);

  const paginatedData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleFilterChange = (key: keyof EVData, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setCurrentPage(1); // Reset to first page when filter changes
  };

  return (
    <div>
      <div className="max-w-full overflow-x-auto">
        <table className="min-w-[1200px] text-sm">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              <th className="px-4 py-2 whitespace-nowrap">
                <input
                  type="text"
                  placeholder="Filter VIN"
                  className="w-full p-1 text-sm border rounded"
                  onChange={(e) => handleFilterChange("VIN", e.target.value)}
                />
              </th>
              <th className="px-4 py-2 whitespace-nowrap">
                <input
                  type="text"
                  placeholder="Filter County"
                  className="w-full p-1 text-sm border rounded"
                  onChange={(e) => handleFilterChange("County", e.target.value)}
                />
              </th>
              <th className="px-4 py-2 whitespace-nowrap">
                <input
                  type="text"
                  placeholder="Filter City"
                  className="w-full p-1 text-sm border rounded"
                  onChange={(e) => handleFilterChange("City", e.target.value)}
                />
              </th>
              <th className="px-4 py-2 whitespace-nowrap">
                <input
                  type="text"
                  placeholder="Filter State"
                  className="w-full p-1 text-sm border rounded"
                  onChange={(e) => handleFilterChange("State", e.target.value)}
                />
              </th>
              <th className="px-4 py-2 whitespace-nowrap">
                <input
                  type="text"
                  placeholder="Filter Postal Code"
                  className="w-full p-1 text-sm border rounded"
                  onChange={(e) =>
                    handleFilterChange("PostalCode", e.target.value)
                  }
                />
              </th>
              <th className="px-4 py-2 whitespace-nowrap">
                <input
                  type="text"
                  placeholder="Filter Year"
                  className="w-full p-1 text-sm border rounded"
                  onChange={(e) =>
                    handleFilterChange("ModelYear", e.target.value)
                  }
                />
              </th>
              <th className="px-4 py-2 whitespace-nowrap">
                <input
                  type="text"
                  placeholder="Filter Make"
                  className="w-full p-1 text-sm border rounded"
                  onChange={(e) => handleFilterChange("Make", e.target.value)}
                />
              </th>
              <th className="px-4 py-2 whitespace-nowrap">
                <input
                  type="text"
                  placeholder="Filter Model"
                  className="w-full p-1 text-sm border rounded"
                  onChange={(e) => handleFilterChange("Model", e.target.value)}
                />
              </th>
              <th className="px-4 py-2 whitespace-nowrap">
                <input
                  type="text"
                  placeholder="Filter Type"
                  className="w-full p-1 text-sm border rounded"
                  onChange={(e) =>
                    handleFilterChange("ElectricVehicleType", e.target.value)
                  }
                />
              </th>
              <th className="px-4 py-2 whitespace-nowrap">
                <input
                  type="text"
                  placeholder="Filter Eligibility"
                  className="w-full p-1 text-sm border rounded"
                  onChange={(e) =>
                    handleFilterChange("Eligibility", e.target.value)
                  }
                />
              </th>
              <th className="px-4 py-2 whitespace-nowrap">
                <input
                  type="text"
                  placeholder="Filter Range"
                  className="w-full p-1 text-sm border rounded"
                  onChange={(e) =>
                    handleFilterChange("ElectricRange", e.target.value)
                  }
                />
              </th>
              <th className="px-4 py-2 whitespace-nowrap">
                <input
                  type="text"
                  placeholder="Filter MSRP"
                  className="w-full p-1 text-sm border rounded"
                  onChange={(e) => handleFilterChange("MSRP", e.target.value)}
                />
              </th>
              <th className="px-4 py-2 whitespace-nowrap">
                <input
                  type="text"
                  placeholder="Filter District"
                  className="w-full p-1 text-sm border rounded"
                  onChange={(e) =>
                    handleFilterChange("LegislativeDistrict", e.target.value)
                  }
                />
              </th>
              <th className="px-4 py-2 whitespace-nowrap">
                <input
                  type="text"
                  placeholder="Filter DOL ID"
                  className="w-full p-1 text-sm border rounded"
                  onChange={(e) =>
                    handleFilterChange("DOLVehicleID", e.target.value)
                  }
                />
              </th>
              <th className="px-4 py-2 whitespace-nowrap">
                <input
                  type="text"
                  placeholder="Filter Location"
                  className="w-full p-1 text-sm border rounded"
                  onChange={(e) =>
                    handleFilterChange("VehicleLocation", e.target.value)
                  }
                />
              </th>
              <th className="px-4 py-2 whitespace-nowrap">
                <input
                  type="text"
                  placeholder="Filter Utility"
                  className="w-full p-1 text-sm border rounded"
                  onChange={(e) =>
                    handleFilterChange("ElectricUtility", e.target.value)
                  }
                />
              </th>
              <th className="px-4 py-2 whitespace-nowrap">
                <input
                  type="text"
                  placeholder="Filter Census"
                  className="w-full p-1 text-sm border rounded"
                  onChange={(e) =>
                    handleFilterChange("CensusTract", e.target.value)
                  }
                />
              </th>
            </tr>
            <tr>
              <th className="px-4 py-2 whitespace-nowrap">VIN</th>
              <th className="px-4 py-2 whitespace-nowrap">County</th>
              <th className="px-4 py-2 whitespace-nowrap">City</th>
              <th className="px-4 py-2 whitespace-nowrap">State</th>
              <th className="px-4 py-2 whitespace-nowrap">Postal Code</th>
              <th className="px-4 py-2 whitespace-nowrap">Model Year</th>
              <th className="px-4 py-2 whitespace-nowrap">Make</th>
              <th className="px-4 py-2 whitespace-nowrap">Model</th>
              <th className="px-4 py-2 whitespace-nowrap">Type</th>
              <th className="px-4 py-2 whitespace-nowrap">Eligibility</th>
              <th className="px-4 py-2 whitespace-nowrap">Range</th>
              <th className="px-4 py-2 whitespace-nowrap">MSRP</th>
              <th className="px-4 py-2 whitespace-nowrap">District</th>
              <th className="px-4 py-2 whitespace-nowrap">DOL ID</th>
              <th className="px-4 py-2 whitespace-nowrap">Location</th>
              <th className="px-4 py-2 whitespace-nowrap">Utility</th>
              <th className="px-4 py-2 whitespace-nowrap">Census</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((car, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{car.VIN?.slice(0, 10)}</td>
                <td className="px-4 py-2">{car.County}</td>
                <td className="px-4 py-2">{car.City}</td>
                <td className="px-4 py-2">{car.State}</td>
                <td className="px-4 py-2">{car.PostalCode}</td>
                <td className="px-4 py-2">{car.ModelYear}</td>
                <td className="px-4 py-2">{car.Make}</td>
                <td className="px-4 py-2">{car.Model}</td>
                <td className="px-4 py-2">{car.ElectricVehicleType}</td>
                <td className="px-4 py-2">{car.Eligibility}</td>
                <td className="px-4 py-2">{car.ElectricRange}</td>
                <td className="px-4 py-2">{car.MSRP}</td>
                <td className="px-4 py-2">{car.LegislativeDistrict}</td>
                <td className="px-4 py-2">{car.DOLVehicleID}</td>
                <td className="px-4 py-2">{car.VehicleLocation}</td>
                <td className="px-4 py-2">{car.ElectricUtility}</td>
                <td className="px-4 py-2">{car.CensusTract}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-center gap-2 mt-4">
        <div className="text-sm text-gray-600">
          Showing {filteredData.length} of {data.length} entries
        </div>
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-4 py-2">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};
