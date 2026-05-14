-- RASCUNHO DE RLS POR UNIDADE
-- NÃO APLICAR EM PRODUÇÃO SEM TESTAR ANTES.
--
-- Estratégia:
-- A API deve informar ao PostgreSQL a unidade atual usando:
-- SET LOCAL app.current_unit_id = 'ID_DA_UNIDADE';
--
-- As tabelas com "unitId" só poderão acessar linhas da unidade atual.

-- Exemplo de uso seguro dentro de transação:
-- BEGIN;
-- SELECT set_config('app.current_unit_id', 'ID_DA_UNIDADE', true);
-- SELECT * FROM "Ticket";
-- COMMIT;

-- =========================================================
-- ATENÇÃO IMPORTANTE
-- =========================================================
-- Se o DATABASE_URL usa o dono das tabelas, o RLS pode ser ignorado.
-- O ideal é criar um usuário de banco específico para a API,
-- sem ser owner das tabelas, e usar esse usuário no DATABASE_URL.

-- =========================================================
-- POLÍTICAS BASEADAS EM unitId
-- =========================================================

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "unit_isolation_user" ON "User"
  USING ("unitId" = current_setting('app.current_unit_id', true))
  WITH CHECK ("unitId" = current_setting('app.current_unit_id', true));

ALTER TABLE "UserUnitAccess" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "unit_isolation_user_unit_access" ON "UserUnitAccess"
  USING ("unitId" = current_setting('app.current_unit_id', true))
  WITH CHECK ("unitId" = current_setting('app.current_unit_id', true));

ALTER TABLE "ParkingLot" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "unit_isolation_parking_lot" ON "ParkingLot"
  USING ("unitId" = current_setting('app.current_unit_id', true))
  WITH CHECK ("unitId" = current_setting('app.current_unit_id', true));

ALTER TABLE "PriceTable" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "unit_isolation_price_table" ON "PriceTable"
  USING ("unitId" = current_setting('app.current_unit_id', true))
  WITH CHECK ("unitId" = current_setting('app.current_unit_id', true));

ALTER TABLE "Ticket" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "unit_isolation_ticket" ON "Ticket"
  USING ("unitId" = current_setting('app.current_unit_id', true))
  WITH CHECK ("unitId" = current_setting('app.current_unit_id', true));

ALTER TABLE "Payment" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "unit_isolation_payment" ON "Payment"
  USING ("unitId" = current_setting('app.current_unit_id', true))
  WITH CHECK ("unitId" = current_setting('app.current_unit_id', true));

ALTER TABLE "CashRegister" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "unit_isolation_cash_register" ON "CashRegister"
  USING ("unitId" = current_setting('app.current_unit_id', true))
  WITH CHECK ("unitId" = current_setting('app.current_unit_id', true));

ALTER TABLE "CashTransaction" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "unit_isolation_cash_transaction" ON "CashTransaction"
  USING ("unitId" = current_setting('app.current_unit_id', true))
  WITH CHECK ("unitId" = current_setting('app.current_unit_id', true));

ALTER TABLE "Gate" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "unit_isolation_gate" ON "Gate"
  USING ("unitId" = current_setting('app.current_unit_id', true))
  WITH CHECK ("unitId" = current_setting('app.current_unit_id', true));

ALTER TABLE "Camera" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "unit_isolation_camera" ON "Camera"
  USING ("unitId" = current_setting('app.current_unit_id', true))
  WITH CHECK ("unitId" = current_setting('app.current_unit_id', true));

ALTER TABLE "Terminal" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "unit_isolation_terminal" ON "Terminal"
  USING ("unitId" = current_setting('app.current_unit_id', true))
  WITH CHECK ("unitId" = current_setting('app.current_unit_id', true));

ALTER TABLE "LprCapture" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "unit_isolation_lpr_capture" ON "LprCapture"
  USING ("unitId" = current_setting('app.current_unit_id', true))
  WITH CHECK ("unitId" = current_setting('app.current_unit_id', true));

ALTER TABLE "Agent" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "unit_isolation_agent" ON "Agent"
  USING ("unitId" = current_setting('app.current_unit_id', true))
  WITH CHECK ("unitId" = current_setting('app.current_unit_id', true));

ALTER TABLE "AgentDevice" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "unit_isolation_agent_device" ON "AgentDevice"
  USING ("unitId" = current_setting('app.current_unit_id', true))
  WITH CHECK ("unitId" = current_setting('app.current_unit_id', true));

ALTER TABLE "AgentEvent" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "unit_isolation_agent_event" ON "AgentEvent"
  USING ("unitId" = current_setting('app.current_unit_id', true))
  WITH CHECK ("unitId" = current_setting('app.current_unit_id', true));

ALTER TABLE "SyncBatch" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "unit_isolation_sync_batch" ON "SyncBatch"
  USING ("unitId" = current_setting('app.current_unit_id', true))
  WITH CHECK ("unitId" = current_setting('app.current_unit_id', true));

ALTER TABLE "AuditOccurrence" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "unit_isolation_audit_occurrence" ON "AuditOccurrence"
  USING ("unitId" = current_setting('app.current_unit_id', true))
  WITH CHECK ("unitId" = current_setting('app.current_unit_id', true));

ALTER TABLE "FiscalConfig" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "unit_isolation_fiscal_config" ON "FiscalConfig"
  USING ("unitId" = current_setting('app.current_unit_id', true))
  WITH CHECK ("unitId" = current_setting('app.current_unit_id', true));

ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "unit_isolation_notification" ON "Notification"
  USING ("unitId" = current_setting('app.current_unit_id', true))
  WITH CHECK ("unitId" = current_setting('app.current_unit_id', true));

ALTER TABLE "Receivable" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "unit_isolation_receivable" ON "Receivable"
  USING ("unitId" = current_setting('app.current_unit_id', true))
  WITH CHECK ("unitId" = current_setting('app.current_unit_id', true));

ALTER TABLE "Payable" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "unit_isolation_payable" ON "Payable"
  USING ("unitId" = current_setting('app.current_unit_id', true))
  WITH CHECK ("unitId" = current_setting('app.current_unit_id', true));

ALTER TABLE "Incident" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "unit_isolation_incident" ON "Incident"
  USING ("unitId" = current_setting('app.current_unit_id', true))
  WITH CHECK ("unitId" = current_setting('app.current_unit_id', true));

