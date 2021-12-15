import React, { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";
import { api } from "../services/api";
import { IProdutoCarrinho } from "../models/produto"

type CarrinhoProps = {
  carrinho: IProdutoCarrinho[];
  setCarrinho: React.Dispatch<React.SetStateAction<IProdutoCarrinho[]>>;
};

export const CarrinhoContext = createContext<CarrinhoProps>({
  carrinho: [] as IProdutoCarrinho[],
  setCarrinho: () => { },
});

export const CarrinhoProvider: React.FC = ({ children }) => {
  const [carrinho, setCarrinho] = useState<IProdutoCarrinho[]>([]);
  const { setUsuario, usuario, token, authenticated } = useContext(AuthContext)

  const checkCart = async () => {
    const cartBrowser = localStorage.getItem("produtos");
    if (cartBrowser && !usuario.carrinho) {
      const carrinhoLocal = JSON.parse(cartBrowser)
      console.log(carrinhoLocal)
      setCarrinho(carrinhoLocal)
    } else {
      const carrinhoBanco = JSON.stringify(usuario.carrinho)
      setCarrinho(JSON.parse(carrinhoBanco))
    }
  };

  useEffect(() => {
    checkCart();
  }, []);

  useEffect(() => {
    console.log(carrinho);
    if (!authenticated) localStorage.setItem("produtos", JSON.stringify(carrinho));
  }, [carrinho])

  const checkDataBase = async () => {
    if (authenticated) {
      api.get("/auth/me", {
        headers: { Authorization: `Bearer ${token?.replace(/"/g, "")} ` },
      }).then((response) => {
        console.log(response.data.carrinho)
        const produtos = localStorage.getItem("produtos")
        // const arr = response.data.carrinho.map((item: IProdutoCarrinho) => {
        //   return item.titulo
        // })
        // if (produtos) {
        //   const produtos1 = JSON.parse(produtos)
        //   for (let index = 0; index < produtos1.length; index++) {
        //     console.log(produtos1)
        //     const element = produtos1[index];
        //     if (arr.includes(element.titulo)) {
        //       console.log(`tem: ${element.titulo}`)
        //     } else {
        //       console.log("não tem");
        //     }
        //   }
        // }
        // let novoCarrinho = carrinho.concat(response.data.carrinho);
        setUsuario(response.data)
        if (response.data.carrinho.length) {
          // if (!localStorage.getItem("loged") && carrinho.length !== 0) {
          // if (window.confirm(`Voce tinha ${carrinho.length} itens no carrinho antes de logar, quer adiconar ao carrinho atual?`)) {
          setCarrinho(response.data.carrinho)
          localStorage.setItem("loged", "0")
          // } else {
          // setCarrinho(response.data.carrinho)
          // localStorage.setItem("loged", "0")
          // }
          // } else {
          //   setCarrinho(response.data.carrinho)
          //   localStorage.setItem("loged", "0")
          // }
        }
      });
    }
  }
  useEffect(() => {
    // if (authenticated) {
    checkDataBase()
  }, [authenticated])

  const addCartToDatabase = async () => {
    console.log(usuario.carrinho)
    if (usuario.carrinho?.length === 0) {
      const produtos = localStorage.getItem("produtos")
      if (produtos) {
        await api.put(
          "auth/edituser",
          {
            carrinho: JSON.parse(produtos)
          },
          { headers: { Authorization: `Bearer ${token?.replace(/"/g, "")}` } }
        );
      }
    } else {
      await api.put(
        "auth/edituser",
        {
          carrinho
        },
        { headers: { Authorization: `Bearer ${token?.replace(/"/g, "")}` } }
      )
      console.log("carrinho")
    }
  }
  useEffect(() => {
    if (authenticated) {
      addCartToDatabase()
    }
  }, [authenticated, carrinho])

  return (
    <CarrinhoContext.Provider value={{ carrinho, setCarrinho }}>
      {children}
    </CarrinhoContext.Provider>
  );
};
