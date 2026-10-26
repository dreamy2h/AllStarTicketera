import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/allstar_tickets';
    console.log(`🔌 Conectando a MongoDB en: ${mongoUri.replace(/:[^:]*@/, ':****@')}`);
    
    await mongoose.connect(mongoUri);
    console.log('✅ Conexión a MongoDB establecida exitosamente');
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error);
    process.exit(1);
  }
};
