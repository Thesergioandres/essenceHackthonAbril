import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { UserModel } from "../database/models/UserModel";
import { OrganizationModel } from "../database/models/OrganizationModel";
import { DonationModel } from "../database/models/DonationModel";
import { UrgentNeedModel } from "../database/models/UrgentNeedModel";
import { ReceiptLogModel } from "../database/models/ReceiptLogModel";

const DEFAULT_MONGODB_URI = "mongodb://localhost:27017/rura";

const SEED_CONFIG = {
  password: "Rura2026!",
  locations: {
    centro: { lat: 2.930, lng: -75.285, address: "Cra. 5 # 10-25, Neiva Centro" },
    comuna1: { lat: 2.941, lng: -75.292, address: "Calle 64 # 1W-12, Cándido Leguízamo" },
    comuna6: { lat: 2.915, lng: -75.278, address: "Calle 20 Sur # 25-40, Canaima" },
    comuna10: { lat: 2.922, lng: -75.265, address: "Calle 19 # 52-10, Las Catleyas" },
  },
  images: {
    frutas: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=800",
    pan: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800",
    lacteos: "https://images.unsplash.com/photo-1563636619-e910ef49e9cf?auto=format&fit=crop&q=80&w=800",
    entrega: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=800"
  }
};

export async function seedDatabase() {
  console.log("🌱 Iniciando Seed Integral RURA Neiva...");
  
  // 1. LIMPIEZA TOTAL
  console.log("🧹 Limpiando colecciones...");
  await Promise.all([
    UserModel.deleteMany({}),
    OrganizationModel.deleteMany({}),
    DonationModel.deleteMany({}),
    UrgentNeedModel.deleteMany({}),
    ReceiptLogModel.deleteMany({})
  ]);

  const passwordHash = await bcrypt.hash(SEED_CONFIG.password, 10);

  // 2. ORGANIZACIONES
  console.log("🏢 Creando organizaciones...");
  const orgExito = await OrganizationModel.create({
    name: "Éxito Neiva",
    location: { ...SEED_CONFIG.locations.centro }
  });

  const orgGaitana = await OrganizationModel.create({
    name: "Panadería La Gaitana",
    location: { ...SEED_CONFIG.locations.comuna1 }
  });

  const orgBanco = await OrganizationModel.create({
    name: "Banco de Alimentos",
    location: { ...SEED_CONFIG.locations.comuna6 }
  });

  const orgSanJose = await OrganizationModel.create({
    name: "Comedor San José",
    location: { ...SEED_CONFIG.locations.comuna10 }
  });

  const orgIndependientes = await OrganizationModel.create({
    name: "Voluntarios Independientes",
    location: { lat: 2.925, lng: -75.280, address: "Zona Operativa Neiva" }
  });

  // 3. USUARIOS
  console.log("👤 Creando usuarios...");
  const userExito = await UserModel.create({
    tenantId: orgExito._id.toString(),
    name: "Gerencia Éxito",
    email: "exito@rura.com",
    role: "donor",
    profileType: "organization",
    password_hash: passwordHash
  });

  const userGaitana = await UserModel.create({
    tenantId: orgGaitana._id.toString(),
    name: "Admin La Gaitana",
    email: "gaitana@rura.com",
    role: "donor",
    profileType: "organization",
    password_hash: passwordHash
  });

  const userBanco = await UserModel.create({
    tenantId: orgBanco._id.toString(),
    name: "Coordinador Banco",
    email: "banco@rura.com",
    role: "foundation",
    profileType: "organization",
    password_hash: passwordHash
  });

  const userSanJose = await UserModel.create({
    tenantId: orgSanJose._id.toString(),
    name: "Directora San José",
    email: "sanjose@rura.com",
    role: "foundation",
    profileType: "organization",
    password_hash: passwordHash
  });

  const userJuan = await UserModel.create({
    tenantId: orgIndependientes._id.toString(),
    name: "Juan Voluntario",
    email: "juan.v@rura.com",
    role: "volunteer",
    profileType: "natural_person",
    password_hash: passwordHash
  });

  const userAna = await UserModel.create({
    tenantId: orgIndependientes._id.toString(),
    name: "Ana Voluntaria",
    email: "ana.v@rura.com",
    role: "volunteer",
    profileType: "natural_person",
    password_hash: passwordHash
  });

  // 4. DONACIONES (10 total: 3 available, 3 requested, 2 picked_up, 2 delivered)
  console.log("🍎 Creando donaciones estratégicas en Neiva...");
  
  // Available
  await DonationModel.create([
    {
      tenantId: orgExito._id.toString(),
      donorId: userExito._id.toString(),
      title: "Excedente de Frutas Tropicales",
      quantity: 45,
      status: "available",
      expirationDate: new Date(Date.now() + 86400000 * 2),
      donorPhoto: SEED_CONFIG.images.frutas
    },
    {
      tenantId: orgGaitana._id.toString(),
      donorId: userGaitana._id.toString(),
      title: "Pan Artesanal del Día",
      quantity: 12,
      status: "available",
      expirationDate: new Date(Date.now() + 3600000 * 12),
      donorPhoto: SEED_CONFIG.images.pan
    },
    {
      tenantId: orgExito._id.toString(),
      donorId: userExito._id.toString(),
      title: "Lote de Yogures Griegos",
      quantity: 20,
      status: "available",
      expirationDate: new Date(Date.now() + 86400000 * 5),
      donorPhoto: SEED_CONFIG.images.lacteos
    }
  ]);

  // Requested (by San José)
  const requestedDonations = await DonationModel.create([
    {
      tenantId: orgExito._id.toString(),
      donorId: userExito._id.toString(),
      title: "Pack de Granos y Arroz",
      quantity: 100,
      status: "requested",
      expirationDate: new Date(Date.now() + 86400000 * 30),
      requestedByTenantId: orgSanJose._id.toString(),
      donorPhoto: SEED_CONFIG.images.entrega
    },
    {
      tenantId: orgGaitana._id.toString(),
      donorId: userGaitana._id.toString(),
      title: "Bolsas de Pan Integral",
      quantity: 15,
      status: "requested",
      expirationDate: new Date(Date.now() + 3600000 * 8),
      requestedByTenantId: orgSanJose._id.toString(),
      donorPhoto: SEED_CONFIG.images.pan
    },
    {
      tenantId: orgExito._id.toString(),
      donorId: userExito._id.toString(),
      title: "Canastas de Huevos",
      quantity: 30,
      status: "requested",
      expirationDate: new Date(Date.now() + 86400000 * 7),
      requestedByTenantId: orgSanJose._id.toString(),
      donorPhoto: SEED_CONFIG.images.lacteos
    }
  ]);

  // Picked Up (by Juan)
  await DonationModel.create([
    {
      tenantId: orgExito._id.toString(),
      donorId: userExito._id.toString(),
      title: "Cajas de Tomate Chonto",
      quantity: 60,
      status: "picked_up",
      expirationDate: new Date(Date.now() + 3600000 * 2), // 2 hours left
      requestedByTenantId: orgSanJose._id.toString(),
      assignedVolunteerId: userJuan._id.toString(),
      donorPhoto: SEED_CONFIG.images.frutas,
      pickupPhoto: SEED_CONFIG.images.frutas
    },
    {
      tenantId: orgGaitana._id.toString(),
      donorId: userGaitana._id.toString(),
      title: "Bulto de Harina de Trigo",
      quantity: 50,
      status: "picked_up",
      expirationDate: new Date(Date.now() + 86400000 * 15),
      requestedByTenantId: orgBanco._id.toString(),
      assignedVolunteerId: userJuan._id.toString(),
      donorPhoto: SEED_CONFIG.images.pan,
      pickupPhoto: SEED_CONFIG.images.pan
    }
  ]);

  // Delivered
  const deliveredDonations = await DonationModel.create([
    {
      tenantId: orgExito._id.toString(),
      donorId: userExito._id.toString(),
      title: "Cargamento de Banano",
      quantity: 80,
      status: "delivered",
      expirationDate: new Date(Date.now() - 86400000),
      requestedByTenantId: orgBanco._id.toString(),
      assignedVolunteerId: userAna._id.toString(),
      donorPhoto: SEED_CONFIG.images.frutas,
      deliveryPhoto: SEED_CONFIG.images.entrega
    },
    {
      tenantId: orgGaitana._id.toString(),
      donorId: userGaitana._id.toString(),
      title: "Excedente de Repostería",
      quantity: 25,
      status: "delivered",
      expirationDate: new Date(Date.now() - 3600000 * 5),
      requestedByTenantId: orgSanJose._id.toString(),
      assignedVolunteerId: userAna._id.toString(),
      donorPhoto: SEED_CONFIG.images.pan,
      deliveryPhoto: SEED_CONFIG.images.entrega
    }
  ]);

  // 5. URGENCIAS CRÍTICAS
  console.log("🚨 Creando urgencias críticas...");
  await UrgentNeedModel.create([
    {
      tenantId: orgBanco._id.toString(),
      description: "Falta de proteínas (Granos/Carnes)",
      priority: "HIGH"
    },
    {
      tenantId: orgSanJose._id.toString(),
      description: "Vegetales frescos para almuerzos comunales",
      priority: "HIGH"
    }
  ]);

  // 6. MÉTRICAS FAO (Receipt Logs)
  console.log("📊 Generando métricas de impacto (+150kg)...");
  const delDonation0 = deliveredDonations[0];
  const delDonation1 = deliveredDonations[1];

  if (delDonation0 && delDonation1) {
    await ReceiptLogModel.create([
      {
        tenantId: orgBanco._id.toString(),
        donationId: delDonation0._id.toString(),
        donorId: userExito._id.toString(),
        quantity: 80,
        receivedAt: new Date(Date.now() - 86400000)
      },
      {
        tenantId: orgSanJose._id.toString(),
        donationId: delDonation1._id.toString(),
        donorId: userGaitana._id.toString(),
        quantity: 25,
        receivedAt: new Date(Date.now() - 3600000 * 5)
      },
      {
        tenantId: orgBanco._id.toString(),
        donationId: new mongoose.Types.ObjectId().toString(), // Histórico ficticio
        donorId: userExito._id.toString(),
        quantity: 45,
        receivedAt: new Date(Date.now() - 86400000 * 2)
      },
      {
        tenantId: orgSanJose._id.toString(),
        donationId: new mongoose.Types.ObjectId().toString(), // Histórico ficticio
        donorId: userGaitana._id.toString(),
        quantity: 50,
        receivedAt: new Date(Date.now() - 86400000 * 3)
      }
    ]);
  }

  console.log("✅ Seed finalizado exitosamente.");
}

async function main() {
  const mongoDbUri = process.env.MONGODB_URI ?? DEFAULT_MONGODB_URI;
  await mongoose.connect(mongoDbUri);
  console.log("📡 Conexión establecida con MongoDB.");
  
  await seedDatabase();
  
  await mongoose.disconnect();
}

main().catch(error => {
  console.error("❌ Error durante el seed:", error);
  process.exit(1);
});
