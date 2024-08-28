export interface ApiResponse<Type>{
    error: boolean;
    err_code?: string;
    msg: string;
    data: Type | undefined;
}

