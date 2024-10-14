interface Window {
    ethereum?: any;
    web3?: any;
  }

  interface PriceHistory {
    price: number;
    timestamp: number;
  }
  
  interface Asset {
    id: string;                   
    name: string;                 
    tokenId: string;              
    value: number;               
    description: string;          
    ownershipDocument: string;    
    images: string[];             
    totalShares: number;          
    pricePerShare: number;       
    shareBalance: Record<string, number>; 
    priceHistory: PriceHistory[]; 
  }
  

  interface Order {
    seller: string;             
    assetId: number;           
    shareAmount: number;        
    pricePerShare: number;     
    isActive: boolean;          
  }
  