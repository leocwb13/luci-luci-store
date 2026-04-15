import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

import { ensureRoles } from "@/lib/auth";

function configureCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary nao configurado.");
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
  });
}

function uploadBuffer(buffer: Buffer, folder: string) {
  return new Promise<{ secure_url: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (error || !result) {
        reject(error ?? new Error("Upload nao concluido."));
        return;
      }
      resolve({ secure_url: result.secure_url });
    });

    stream.end(buffer);
  });
}

export async function POST(request: Request) {
  const canUpload = await ensureRoles(["admin", "operacao", "vendedor"]);
  if (!canUpload) {
    return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
  }

  try {
    configureCloudinary();
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Arquivo obrigatorio." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadBuffer(buffer, "luci-luci");
    return NextResponse.json({ imageUrl: uploaded.secure_url });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Falha ao enviar imagem."
      },
      { status: 500 }
    );
  }
}
