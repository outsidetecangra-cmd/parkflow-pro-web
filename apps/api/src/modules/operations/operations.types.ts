export type EntryBody = {
  unitId?: string;
  origin?: string;
  plate?: string;
  vehicleModel?: string;
  vehicleColor?: string;
  customerType?: string;
  customerName?: string;
  yardId?: string;
  spotCode?: string;
  priceTableId?: string;
  terminalId?: string;
  cameraId?: string;
  lpr?: {
    plate?: string;
    confidence?: number;
  };
  notes?: string;
};

export type ExitCalculateBody = {
  ticketCode?: string;
  unitId?: string;
  exitAt?: string;
  couponCode?: string | null;
  partnerValidationCode?: string | null;
};

export type ExitConfirmBody = {
  ticketCode?: string;
  unitId?: string;
  exitAt?: string;
  payment?: {
    method?: string;
    amount?: number;
    status?: string;
    reference?: string;
  };
  discount?: {
    amount?: number;
    reason?: string;
  };
  lpr?: {
    plate?: string;
    confidence?: number;
  };
  gateId?: string;
};

