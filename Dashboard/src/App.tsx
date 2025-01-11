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
  Calendar,
} from "lucide-react";
import { EVData } from "./types";
import { DashboardCard } from "./components/DashboardCard";
import { StatsCard } from "./components/StatsCard";

interface PostalCodeData {
  name: string;
  value: number;
  models: string[];
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

function App() {
  const [data, setData] = useState<EVData[]>([]);
  const [loading, setLoading] = useState(true);

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
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">
          Electric Vehicle Population Dashboard
        </h1>

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
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3B82F6" />
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
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
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
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
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
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={Object.entries(
                    data.reduce((acc, curr) => {
                      const range = Math.floor(curr.ElectricRange / 50) * 50;
                      acc[`${range}-${range + 50}`] =
                        (acc[`${range}-${range + 50}`] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([name, value]) => ({ name, value }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    label={{ value: "Range (miles)", position: "bottom" }}
                  />
                  <YAxis
                    label={{
                      value: "Number of Vehicles",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <Tooltip />
                  <Bar dataKey="value" fill="#9C27B0" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}

export default App;
