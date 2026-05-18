export async function onRequest({ request, next }) {
    const url = new URL(request.url);
    if (url.hostname === "calderyn-registry.pages.dev") {
          url.hostname = "calderyncollege.uk";
          return Response.redirect(url.toString(), 301);
    }
    return next();
}
