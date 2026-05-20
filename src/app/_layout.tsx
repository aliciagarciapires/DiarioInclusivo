import {Stack} from "expo-router" //stack funciona como paaginas empilhadas
//como as páginas vao navegar entre si

export default function Layout (){
    return(
        <Stack screenOptions={{ headerShown: false}} /> //define que todas as pastas irão usar Stack
        //headerShoown: false esconde o cabeçalho automático
    )
}