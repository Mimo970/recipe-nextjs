import "../styles/globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import cors from "../../middleware/cors";
import { ThemeProvider } from "next-themes";
import { AuthContextProvider } from "../../contexts/AuthContext";
import { FavoriteRecipesProvider } from "../../contexts/FavoritesContext";

export default function App({ Component, pageProps }) {
  return (
    <AuthContextProvider>
      <FavoriteRecipesProvider>
        <ThemeProvider enableSystem={true} attribute="class">
          <Component {...pageProps} />{" "}
        </ThemeProvider>
      </FavoriteRecipesProvider>
    </AuthContextProvider>
  );
}

App.getInitialProps = async ({ Component, ctx }) => {
  let pageProps = {};
  if (Component.getInitialProps) {
    pageProps = await Component.getInitialProps(ctx);
  }
  if (ctx.req) {
    cors(ctx.req, ctx.res, () => {});
  }
  return { pageProps };
};
