// app/page.tsx (o cualquier otra página)

import ItemCard from "./ItemCardPay";

export default function HomePage() {
  return (
    <div>
      <h1>Nuestros Productos</h1>
      <ItemCard
        itemId="PROD-123"
        name="Artículo de Ejemplo"
        description="Una descripción breve de este fantástico artículo."
        price={15.75} // El monto CMTN se tomará de aquí
        imageUrl="/images/producto_ejemplo.jpg" // Opcional
      />
      <ItemCard
        itemId="PROD-456"
        name="Otro Artículo"
        description="Descripción del segundo artículo."
        price={25.0}
      />
      {/* Puedes añadir más artículos aquí */}
    </div>
  );
}
