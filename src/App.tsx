import React, { useEffect, useState } from "react";
import { parse } from "papaparse";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Car,
  Battery,
  MapPin,
  DollarSign,
  Building,
  Sun,
  Moon,
} from "lucide-react";
import { EVData } from "./types";
import { Button } from "@/components/ui/button";
import { DashboardCard } from "./components/DashboardCard";
import { StatsCard } from "./components/StatsCard";
import { DataTable } from "./components/DataTable";
import { useTheme } from "./components/ThemeProvider";
import { ThemeProvider } from "./components/ThemeProvider";

interface PostalCodeData {
  name: string;
  value: number;
  models: string[];
}

function App() {
  const [data, setData] = useState<EVData[]>([]);
  const [loading, setLoading] = useState(true);
  const { isDarkMode, toggleDarkMode } = useTheme();

  const chartColors = isDarkMode
    ? ["#60A5FA", "#34D399", "#FBBF24", "#F87171"]
    : ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"];
  useEffect(() => {
    fetch("/data/Electric_Vehicle_Population_Data.csv")
      .then((response) => response.text())
      .then((csvData) => {
        const results = parse(csvData, {
          header: true,
          transform: (value) => {
            if (value === "") return null;
            const num = Number(value);
            return isNaN(num) ? value : num;
          },
        });
        setData(results.data as EVData[]);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const makeDistribution = Object.entries(
    data.reduce((acc, curr) => {
      acc[curr.Make] = (acc[curr.Make] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  const averageRange = Math.round(
    data.reduce((acc, curr) => acc + (curr.ElectricRange || 0), 0) / data.length
  );

  const averagePrice = Math.round(
    data.reduce((acc, curr) => acc + (curr.MSRP || 0), 0) / data.length
  );

  const totalVehicles = data.length;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-8">
          Electric Vehicle Population Dashboard
        </h1>
        {/* <Button
          variant="ghost"
          size="icon"
          onClick={toggleDarkMode}
          className="absolute top-8 right-8"
        >
          {isDarkMode ? (
            <Sun className="h-12 w-12" />
          ) : (
            <Moon className="h-12 w-h-12" />
          )}
        </Button> */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard title="Total Vehicles" value={totalVehicles} icon={Car} />
          <StatsCard
            title="Average Range"
            value={`${averageRange} miles`}
            icon={Battery}
          />
          <StatsCard
            title="Most Common Location"
            value="Seattle"
            icon={MapPin}
          />
          <StatsCard
            title="Average MSRP"
            value={`$${averagePrice.toLocaleString()}`}
            icon={DollarSign}
          />
          <StatsCard
            title="Total Cities"
            value={new Set(data.map((ev) => ev.City)).size}
            icon={Building}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <DashboardCard title="Manufacturer Distribution">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={makeDistribution}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDarkMode ? "#374151" : "#E5E7EB"}
                  />
                  <XAxis
                    dataKey="name"
                    stroke={isDarkMode ? "#D1D5DB" : "#374151"}
                  />
                  <YAxis stroke={isDarkMode ? "#D1D5DB" : "#374151"} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDarkMode ? "#1F2937" : "#FFFFFF",
                      borderColor: isDarkMode ? "#374151" : "#E5E7EB",
                      color: isDarkMode ? "#D1D5DB" : "#374151",
                    }}
                  />
                  <Bar dataKey="value" fill={chartColors[0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </DashboardCard>

          <DashboardCard title="Vehicle Types">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={makeDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {makeDistribution.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={chartColors[index % chartColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDarkMode ? "#1F2937" : "#FFFFFF",
                      borderColor: isDarkMode ? "#374151" : "#E5E7EB",
                      color: isDarkMode ? "#D1D5DB" : "#374151",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </DashboardCard>
          <DashboardCard title="Electric Vehicle Types">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={Object.entries(
                      data
                        .filter((ev) => ev.ElectricVehicleType) // Filter out null/undefined
                        .reduce((acc, curr) => {
                          acc[curr.ElectricVehicleType] =
                            (acc[curr.ElectricVehicleType] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>)
                    ).map(([name, value]) => ({ name, value }))}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {makeDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          isDarkMode
                            ? ["#60A5FA", "#34D399", "#FBBF24", "#F87171"][
                                index % 4
                              ]
                            : ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"][
                                index % 4
                              ]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </DashboardCard>
          <DashboardCard title="Vehicles by Postal Code">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={Object.entries(
                    data.reduce((acc, curr) => {
                      if (!curr.PostalCode) return acc;
                      if (!acc[curr.PostalCode]) {
                        acc[curr.PostalCode] = {
                          count: 0,
                          models: new Set<string>(),
                        };
                      }
                      acc[curr.PostalCode].count++;
                      acc[curr.PostalCode].models.add(
                        `${curr.Make} ${curr.Model}`
                      );
                      return acc;
                    }, {} as Record<string, { count: number; models: Set<string> }>)
                  )
                    .sort((a, b) => b[1].count - a[1].count)
                    .slice(0, 10)
                    .map(
                      ([postalCode, data]): PostalCodeData => ({
                        name: postalCode,
                        value: data.count,
                        models: Array.from(data.models),
                      })
                    )}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as PostalCodeData;
                        return (
                          <div className="bg-white p-4 rounded shadow">
                            <p className="font-bold">
                              Postal Code: {data.name}
                            </p>
                            <p>Total Vehicles: {data.value}</p>
                            <p>Unique Models: {data.models.length}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="value" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </DashboardCard>
        </div>
        <div className="grid grid-cols-1 gap-8 mt-10">
          <DashboardCard title="Electric Range Distribution">
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  className="h-full"
                  data={Object.entries(
                    data
                      .filter(
                        (car) => car.ElectricRange && !isNaN(car.ElectricRange)
                      )
                      .reduce((acc, curr) => {
                        const range = Math.floor(curr.ElectricRange / 50) * 50;
                        const rangeKey = `${range}-${range + 50}`;
                        acc[rangeKey] = (acc[rangeKey] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                  )
                    .map(([name, value]) => ({
                      name: `${name} miles`,
                      value,
                    }))
                    .sort((a, b) => parseInt(a.name) - parseInt(b.name))}
                  margin={{ bottom: 10, left: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    label={{
                      value: "Range (miles)",
                      position: "bottom",
                      offset: 0,
                      dy: -5,
                    }}
                  />
                  <YAxis
                    label={{
                      value: "Number of Vehicles",
                      angle: -90,
                      position: "insideLeft",
                      dx: -5,
                    }}
                  />
                  <Tooltip />
                  <Bar dataKey="value" fill="#9C27B0" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </DashboardCard>
          <DashboardCard title="Model Year Distribution">
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={Object.entries(
                    data
                      .filter((car) => car.ModelYear && !isNaN(car.ModelYear)) // Filter undefined
                      .reduce((acc, curr) => {
                        const year = parseInt(curr.ModelYear.toString());
                        if (year >= 2000 && year <= 2024) {
                          // Valid year range
                          acc[year] = (acc[year] || 0) + 1;
                        }
                        return acc;
                      }, {} as Record<string, number>)
                  )
                    .map(([year, count]) => ({
                      year: year.toString(),
                      count,
                    }))
                    .sort((a, b) => parseInt(a.year) - parseInt(b.year))}
                  margin={{ bottom: 10, left: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="year"
                    label={{
                      value: "Model Year",
                      position: "bottom",
                      offset: 0,
                      dy: -5,
                    }}
                  />
                  <YAxis
                    label={{
                      value: "Number of Vehicles",
                      angle: -90,
                      position: "insideLeft",
                      dx: -5,
                    }}
                  />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2196F3" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </DashboardCard>
          <DashboardCard title="Detailed Vehicle Information">
            <DataTable data={data} itemsPerPage={10} />
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}

export default App;
