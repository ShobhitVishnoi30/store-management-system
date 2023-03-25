export interface ApiResponse {
  status: boolean;
  statusCode: number;
  error?: string;
  message?: string;
  data?: any;
}
