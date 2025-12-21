/**
 * Type untuk parameter query yang umum digunakan dalam API requests
 */
export interface QueryParams {
    /** Nomor halaman (1-based) */
    page?: number;
    /** Jumlah item per halaman */
    limit?: number;
    /** Status aktif (1 = aktif, 0 = tidak aktif) */
    isActive?: number;
    /** Kata kunci pencarian */
    search?: string;
    status?: string;
    /** Sorting (format: "field:direction" contoh: "name:asc") */
    orderBy?: string;
    /** Filter tambahan (opsional) */
    filters?: {
        [key: string]: string | number | boolean | null | undefined;
    };
    /** Include related data (opsional) */
    include?: string[];
    /** Fields yang ingin di-select (opsional) */
    fields?: string[];
}

/**
 * Utility type untuk response pagination
 */
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}