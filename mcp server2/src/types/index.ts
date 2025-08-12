export interface WordPressConfig {
  url: string;
  username: string;
  password: string;
  consumerKey: string;
  consumerSecret: string;
  accessToken?: string;
}

export interface WooCommerceOrder {
  id: number;
  number: string;
  status: string;
  date_created: string;
  total: string;
  customer_id: number;
  billing: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  line_items: Array<{
    product_id: number;
    name: string;
    quantity: number;
    total: string;
  }>;
}

export interface FileOperation {
  path: string;
  content?: string;
  operation: 'read' | 'write' | 'edit' | 'delete' | 'backup';
}

export interface AIResponse {
  message: string;
  action?: string;
  data?: any;
  success: boolean;
}

export interface OrderCommand {
  orderId: string;
  action: 'complete' | 'cancel' | 'refund' | 'update_status';
  status?: string;
  note?: string;
}

export interface FileChange {
  path: string;
  type: 'created' | 'modified' | 'deleted';
  content?: string;
  timestamp: Date;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: any;
  handler: (args: any) => Promise<any>;
}
