// Dev do Corre — wrapper homebrew pro Nintendo Switch (Atmosphère).
//
// Este NRO não renderiza nada por conta própria: ele sobe o Web Applet
// OFFLINE do sistema (nifm/web) apontando pro build do Vite que viaja
// embutido no RomFS deste próprio .nro.
//
// Detalhe importante da API: pra WebDocumentKind_OfflineHtmlPage, o docPath
// é relativo a "html-document/" DENTRO do RomFS. Por isso a dist/ do Vite
// é copiada pra romfs/html-document/ (ver Makefile + README).

#include <stdio.h>
#include <switch.h>

static void mostraErro(Result rc, const char* etapa)
{
    // Fallback de console: se algo der errado antes do applet, o usuário
    // pelo menos lê o código de erro em vez de tomar tela preta.
    consoleInit(NULL);

    PadState pad;
    padConfigureInput(1, HidNpadStyleSet_NpadStandard);
    padInitializeDefault(&pad);

    printf("\n  Dev do Corre — falha ao iniciar\n");
    printf("  Etapa : %s\n", etapa);
    printf("  Erro  : 0x%08x\n\n", rc);
    printf("  Pressione + para sair.\n");

    while (appletMainLoop()) {
        padUpdate(&pad);
        if (padGetButtonsDown(&pad) & HidNpadButton_Plus) break;
        consoleUpdate(NULL);
    }
    consoleExit(NULL);
}

int main(int argc, char* argv[])
{
    // Monta o RomFS embutido no NRO (onde mora o build do jogo).
    Result rc = romfsInit();
    if (R_FAILED(rc)) {
        mostraErro(rc, "romfsInit");
        return 0;
    }

    WebCommonConfig config;
    WebCommonReply  reply;

    // id = 0  -> usa o RomFS do próprio processo (este .nro).
    // "index.html" é resolvido a partir de romfs:/html-document/.
    rc = webOfflineCreate(&config, WebDocumentKind_OfflineHtmlPage, 0, "index.html");
    if (R_FAILED(rc)) {
        romfsExit();
        mostraErro(rc, "webOfflineCreate");
        return 0;
    }

    // Rodapé habilitado: dá ao usuário o botão de fechar/voltar do applet.
    webConfigSetFooterEnabled(&config, true);

    // Bloqueante: só retorna quando o usuário fecha o applet.
    rc = webConfigShow(&config, &reply);
    if (R_FAILED(rc)) {
        romfsExit();
        mostraErro(rc, "webConfigShow");
        return 0;
    }

    romfsExit();
    return 0;
}
