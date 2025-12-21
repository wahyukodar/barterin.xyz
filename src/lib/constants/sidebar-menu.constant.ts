import { goto } from "$app/navigation";
import { CASHIER_URL, DASHBOARD_URL, LANGGANAN_PRODUCT_URL, LANGGANAN_PRODUCT_VARIATION_URL, LANGGANAN_URL, PRODUCT_URL, PROFILE_URL, STOCK_MUTATION_URL, TRANSACTION_URL, WAREHOUSE_URL } from "$lib/constants/url.constant";
import { BellPlus, Boxes, House, ListPlus, Package, Receipt, Settings, User, UserCog, UserStar, Warehouse } from "lucide-svelte";

export const MENU = [
	{
		label: 'Dashboard',
		icon: House,
		path: DASHBOARD_URL,
		onClick: () => goto(DASHBOARD_URL)
	},
	{
		label: 'Produk',
		icon: Package,
		path: PRODUCT_URL,
		onClick: () => goto(PRODUCT_URL)
	},
	{
		label: 'Gudang',
		icon: Warehouse,
		path: WAREHOUSE_URL,
		onClick: () => goto(WAREHOUSE_URL)
	},
	{
		label: 'Mutasi Stok',
		icon: Boxes,
		path: STOCK_MUTATION_URL,
		onClick: () => goto(STOCK_MUTATION_URL)
	},
	{
		label: 'Langganan',
		icon: BellPlus,
		children: [
			{
				label: 'Pelanggan',
				icon: UserStar,
				path: LANGGANAN_URL,
				onClick: () => goto(LANGGANAN_URL)
			},
			{
				label: 'Produk',
				icon: Package,
				path: LANGGANAN_PRODUCT_URL,
				onClick: () => goto(LANGGANAN_PRODUCT_URL)
			},
			{
				label: 'Variasi Produk',
				icon: ListPlus,
				path: LANGGANAN_PRODUCT_VARIATION_URL,
				onClick: () => goto(LANGGANAN_PRODUCT_VARIATION_URL)
			}
		]
	},
	{
		label: 'Kasir',
		icon: UserCog,
		path: CASHIER_URL,
		onClick: () => goto(CASHIER_URL)
	},
	{
		label: 'Transaksi',
		icon: Receipt,
		path: TRANSACTION_URL,
		onClick: () => goto(TRANSACTION_URL)
	},
	{
		label: 'Settings',
		icon: Settings,
		children: [
			{
				label: 'Profile',
				icon: User,
				path: PROFILE_URL,
				onClick: () => goto(PROFILE_URL)
			}
		]
	},
];
