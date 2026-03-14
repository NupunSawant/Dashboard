import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";
import { API } from "../helpers/api_url";

type WarehouseMasterRow = {
	id?: string;
	warehouseName?: string;
};

export function useWarehouseMasterOptions() {
	return useQuery<string[]>({
		queryKey: ["warehouse-master-options"],
		queryFn: async () => {
			const { data } = await api.get(API.WAREHOUSES.LIST);

			const list =
				data?.data?.warehouses ?? data?.warehouses ?? data?.data ?? data;

			const rows = Array.isArray(list) ? (list as WarehouseMasterRow[]) : [];

			return Array.from(
				new Set(
					rows.map((x) => String(x.warehouseName || "").trim()).filter(Boolean),
				),
			).sort((a, b) => a.localeCompare(b));
		},
		staleTime: 1000 * 60 * 5,
		refetchOnWindowFocus: false,
	});
}
