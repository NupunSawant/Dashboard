import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";
import { API } from "../helpers/api_url";
import type {
	DashboardInventoryTableFilters,
	DashboardInventoryTableResponse,
} from "../types/Dashboard/dashboard";

export function useInventoryDashboard(filters: DashboardInventoryTableFilters) {
	return useQuery<DashboardInventoryTableResponse>({
		queryKey: [
			"dashboard-inventory-table",
			filters.warehouseName || "",
			filters.category || "",
			filters.search || "",
			filters.page || 1,
			filters.limit || 10,
			filters.sortBy || "srNo",
			filters.sortOrder || "asc",
		],
		queryFn: async () => {
			const response = await api.get(API.DASHBOARD_INVENTORY_TABLE, {
				params: {
					warehouseName: filters.warehouseName || undefined,
					category: filters.category || undefined,
					search: filters.search || undefined,
					page: filters.page || 1,
					limit: filters.limit || 10,
					sortBy: filters.sortBy || "srNo",
					sortOrder: filters.sortOrder || "asc",
				},
			});

			const payload = response?.data?.data ?? response?.data ?? {};

			return {
				rows: Array.isArray(payload?.rows) ? payload.rows : [],
				pagination: {
					page: Number(payload?.pagination?.page ?? filters.page ?? 1),
					limit: Number(payload?.pagination?.limit ?? filters.limit ?? 10),
					total: Number(payload?.pagination?.total ?? 0),
					totalPages: Number(payload?.pagination?.totalPages ?? 1),
				},
				meta: {
					categories: Array.isArray(payload?.meta?.categories)
						? payload.meta.categories
						: [],
					appliedFilters: {
						warehouseName: String(
							payload?.meta?.appliedFilters?.warehouseName ?? "",
						),
						category: String(payload?.meta?.appliedFilters?.category ?? ""),
						search: String(payload?.meta?.appliedFilters?.search ?? ""),
						sortBy: String(payload?.meta?.appliedFilters?.sortBy ?? "srNo"),
						sortOrder:
							payload?.meta?.appliedFilters?.sortOrder === "desc"
								? "desc"
								: "asc",
					},
				},
			};
		},
		placeholderData: (previousData) => previousData,
		staleTime: 1000 * 30,
		refetchOnWindowFocus: false,
	});
}
