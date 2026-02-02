import {
  Html,
  Body,
  Container,
  Text,
  Heading,
  Hr,
  Section,
  Row,
  Column,
} from "@react-email/components";
import * as React from "react";

interface LowStockEmailProps {
  productName: string;
  currentQuantity: number;
  lowStockThreshold: number;
  inventorySummary?: {
    totalItems: number;
    lowStockCount: number;
    totalValue: number;
  };
}

export const LowStockEmailTemplate = ({
  productName,
  currentQuantity,
  lowStockThreshold,
  inventorySummary,
}: LowStockEmailProps) => (
  <Html>
    <Body style={{ backgroundColor: "#f6f9fc", padding: "20px" }}>
      <Container style={{ backgroundColor: "#ffffff", border: "1px solid #e1e1e1", padding: "40px", borderRadius: "10px" }}>
        <Heading style={{ color: "#EF4444", fontSize: "24px" }}>Low Stock Alert! ⚠️</Heading>
        <Text>Your product <strong>{productName}</strong> is running low on inventory.</Text>
        
        <Section style={{ background: "#f8f9fa", padding: "20px", borderRadius: "8px", textAlign: "center" as const }}>
          <Text style={{ margin: "0", fontSize: "16px" }}>Current Quantity:</Text>
          <Text style={{ fontSize: "32px", fontWeight: "bold", color: "#dc2626", margin: "10px 0" }}>{currentQuantity}</Text>
          <Text style={{ margin: "0", color: "#666" }}>Threshold Set: {lowStockThreshold}</Text>
        </Section>

        {inventorySummary && (
          <>
            <Hr style={{ margin: "30px 0", borderColor: "#eeeeee" }} />
            <Heading style={{ fontSize: "18px", color: "#333" }}>Inventory Summary</Heading>
            <Section style={{ padding: "10px 0" }}>
              <Row>
                <Column>
                  <Text style={{ margin: "0", color: "#666", fontSize: "12px" }}>TOTAL ITEMS</Text>
                  <Text style={{ margin: "0", fontWeight: "bold" }}>{inventorySummary.totalItems}</Text>
                </Column>
                <Column>
                  <Text style={{ margin: "0", color: "#666", fontSize: "12px" }}>AT RISK</Text>
                  <Text style={{ margin: "0", fontWeight: "bold", color: "#dc2626" }}>{inventorySummary.lowStockCount}</Text>
                </Column>
                <Column>
                  <Text style={{ margin: "0", color: "#666", fontSize: "12px" }}>TOTAL VALUE</Text>
                  <Text style={{ margin: "0", fontWeight: "bold" }}>${inventorySummary.totalValue.toLocaleString()}</Text>
                </Column>
              </Row>
            </Section>
          </>
        )}

        <Hr style={{ margin: "20px 0", borderColor: "#eeeeee" }} />
        <Text style={{ fontSize: "11px", color: "#999", textAlign: "center" as const }}>
          This is an automated notification from your Stock.app Dashboard.
        </Text>
      </Container>
    </Body>
  </Html>
);