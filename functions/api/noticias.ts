// functions/api/noticias.ts
export const onRequestGet = async (context: any) => {
  const apiKey = context.env.GNEWS_API_KEY; // La clave se guarda de forma segura en Cloudflare
  const url = `https://gnews.io/api/v4/top-headlines?category=health&lang=es&country=co&max=6&apikey=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data.articles) {
      return new Response(
        JSON.stringify({
          error: "No se encontraron noticias o la API Key es incorrecta",
        }),
        { status: 500 },
      );
    }

    // Solo devolvemos los campos que nos interesan para no saturar la web
    const noticias = data.articles.map((articulo: any) => ({
      titulo: articulo.title,
      descripcion: articulo.description,
      url: articulo.url,
      imagen: articulo.image,
      fuente: articulo.source.name,
      fecha: articulo.publishedAt,
    }));

    return new Response(JSON.stringify(noticias), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "No se pudieron cargar las noticias" }),
      { status: 500 },
    );
  }
};
