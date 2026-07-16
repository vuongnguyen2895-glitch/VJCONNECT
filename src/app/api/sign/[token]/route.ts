import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { computeStatusFromSignatures } from "@/lib/contract-utils";
import { PartyRole } from "@prisma/client";

/**
 * GET /api/sign/:token — Public: fetch contract summary for the signing party
 * No auth required — access is gated by the unguessable token itself.
 */
export async function GET(_req: Request, { params }: { params: { token: string } }) {
  const party = await db.contractParty.findFirst({
    where: { signingUrl: params.token },
    include: {
      contract: {
        include: {
          template: { select: { name: true, icon: true } },
          parties: { select: { role: true, name: true, cccd: true, phone: true, email: true, signedAt: true } },
        },
      },
    },
  });

  if (!party) {
    return NextResponse.json({ error: "Liên kết ký không hợp lệ hoặc đã hết hạn" }, { status: 404 });
  }

  return NextResponse.json({
    party: { role: party.role, name: party.name, signedAt: party.signedAt },
    contract: {
      contractNo: party.contract.contractNo,
      title: party.contract.title,
      status: party.contract.status,
      dataJson: party.contract.dataJson,
      startDate: party.contract.startDate,
      endDate: party.contract.endDate,
      rentAmount: party.contract.rentAmount,
      deposit: party.contract.deposit,
      template: party.contract.template,
      parties: party.contract.parties,
    },
  });
}

/**
 * POST /api/sign/:token — Public: submit a signature for this party
 */
export async function POST(_req: Request, { params }: { params: { token: string } }) {
  const party = await db.contractParty.findFirst({
    where: { signingUrl: params.token },
    include: { contract: { include: { parties: true } } },
  });

  if (!party) {
    return NextResponse.json({ error: "Liên kết ký không hợp lệ hoặc đã hết hạn" }, { status: 404 });
  }
  if (party.signedAt) {
    return NextResponse.json({ error: "Bạn đã ký hợp đồng này rồi" }, { status: 400 });
  }
  if (party.contract.status === "TERMINATED" || party.contract.status === "EXPIRED") {
    return NextResponse.json({ error: "Hợp đồng này không còn hiệu lực để ký" }, { status: 400 });
  }

  const now = new Date();
  const signatureRef = `SIG-${randomBytes(4).toString("hex").toUpperCase()}`;

  await db.contractParty.update({
    where: { id: party.id },
    data: { signedAt: now, signatureRef },
  });

  const landlord = party.contract.parties.find((p) => p.role === PartyRole.LANDLORD);
  const tenant = party.contract.parties.find((p) => p.role === PartyRole.TENANT);
  const landlordSignedAt = party.role === PartyRole.LANDLORD ? now : (landlord?.signedAt ?? null);
  const tenantSignedAt = party.role === PartyRole.TENANT ? now : (tenant?.signedAt ?? null);

  const newStatus = computeStatusFromSignatures(landlordSignedAt, tenantSignedAt, party.contract.status);

  await db.contract.update({
    where: { id: party.contractId },
    data: {
      status: newStatus,
      signedAt: newStatus === "SIGNED" ? now : undefined,
      activities: {
        create: {
          action: party.role === PartyRole.LANDLORD ? "signed_by_landlord" : "signed_by_tenant",
          actorName: party.name,
        },
      },
    },
  });

  return NextResponse.json({ ok: true, signedAt: now, status: newStatus });
}
