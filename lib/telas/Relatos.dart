import 'package:branch1/telas/exportador_import.dart';
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:file_picker/file_picker.dart';
import 'dart:io';

class Relatos_tela extends StatefulWidget {
  const Relatos_tela({
    super.key,
    required this.title,
  });

  final String title;

  @override
  State<Relatos_tela> createState() => _Relatos_telaState();

}

class _Relatos_telaState extends State<Relatos_tela> {
  File? imagemSelecionada;
  int? tipoSelecionado;
  int? nivelSelecionado;
  Future<void> selecionarImagem() async {
    FilePickerResult? resultado = await FilePicker.platform.pickFiles(
      type: FileType.image,
      allowCompression: false, // Adicione isso para garantir que ele não mude o arquivo
    );

    if (resultado != null && resultado.files.single.path != null) {
      setState(() {
        // Criamos um novo objeto File a partir do caminho retornado
        imagemSelecionada = File(resultado.files.single.path!);
      });
      print("Caminho da imagem: ${imagemSelecionada!.path}");
    } else {
      print("Nenhuma imagem selecionada.");
    }
  }
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,

      body: Stack(
        children: [

          SafeArea(
            child: SingleChildScrollView(
              child: Center(child: Column(
                verticalDirection: VerticalDirection.down,
                mainAxisSize: MainAxisSize.max,

                children: <Widget>[

                  Text(
                    'Informe as informações para reportar:',
                    style: TextStyle(

                      fontSize: 21,
                      fontWeight: FontWeight.bold,
                      color: Colors.black,
                    ),
                  ),

                  GestureDetector(
                    onTap: selecionarImagem,
                    child: Container(
                      width: double.infinity,
                      height: 150,
                      decoration: BoxDecoration(
                        border: Border.all(color: Colors.black),
                        borderRadius: BorderRadius.circular(8),
                      ),

                      child: imagemSelecionada == null
                          ? const Padding(
                        padding: EdgeInsets.all(8),
                        child: Text('Insira uma imagem'),
                      )
                          : ClipRRect(
                        borderRadius: BorderRadius.circular(7),
                        child: Image.file(
                          imagemSelecionada!,
                          width: double.infinity,
                          height: double.infinity,
                          fit: BoxFit.cover,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  Text(
                    'Escolha o tipo de desastre:',
                    style: TextStyle(

                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Colors.black54,

                    ),
                  ),
                  const SizedBox(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // PRIMEIRO BOTÃO (Valor 0)

                      GestureDetector(
                        onTap: () => setState(() => tipoSelecionado = 0),
                        child: Container(
                          width: 24,
                          height: 24,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: tipoSelecionado == 0 ? Colors.blue : Colors.transparent,
                            border: Border.all(color: Colors.blue, width: 2),
                          ),
                        ),
                      ),

                      SizedBox(width: 20), // Espaço entre eles

                      // SEGUNDO BOTÃO (Valor 1)
                      GestureDetector(
                        onTap: () => setState(() => tipoSelecionado = 1),
                        child: Container(
                          width: 24,
                          height: 24,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: tipoSelecionado == 1 ? Colors.blue : Colors.transparent,
                            border: Border.all(color: Colors.blue, width: 2),
                          ),
                        ),
                      ),
                      SizedBox(width: 20), // Espaço entre eles

                      // terceiro BOTÃO (Valor 2)
                      GestureDetector(
                        onTap: () => setState(() => tipoSelecionado = 2),
                        child: Container(
                          width: 24,
                          height: 24,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: tipoSelecionado == 2 ? Colors.blue : Colors.transparent,
                            border: Border.all(color: Colors.blue, width: 2),
                          ),
                        ),
                      ),
                      SizedBox(width: 20), // Espaço entre eles

                      // quarto BOTÃO (Valor 3)
                      GestureDetector(
                        onTap: () => setState(() => tipoSelecionado = 3),
                        child: Container(
                          width: 24,
                          height: 24,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: tipoSelecionado == 3 ? Colors.blue : Colors.transparent,
                            border: Border.all(color: Colors.blue, width: 2),
                          ),
                        ),
                      ),



                    ],
                  ),
                  const SizedBox(height: 20),
                  Text(
                    'Classifique de a periculosidade/risco:',
                    style: TextStyle(

                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Colors.black54,

                    ),
                  ),
                  Text(
                    '(considere 1 menor periculosidade 5 maior periculosidade:',
                    style: TextStyle(

                      fontSize: 15,

                      color: Colors.black54,

                    ),
                  ),
                  const SizedBox(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // --- BOTÃO 1 ---
                      Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          GestureDetector(
                            onTap: () => setState(() => nivelSelecionado = 0),
                            child: Container(
                              width: 24, height: 24,
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(5),
                                shape: BoxShape.rectangle,
                                color: nivelSelecionado == 0 ? Colors.yellowAccent : Colors.transparent,
                                border: Border.all(color: Colors.yellowAccent, width: 2),
                              ),
                            ),
                          ),
                          const SizedBox(height: 4),
                          const Text("1", style: TextStyle(fontSize: 12, color:Colors.yellowAccent)),
                        ],
                      ),
                      const SizedBox(width: 20),

                      // --- BOTÃO 2 ---
                      Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          GestureDetector(
                            onTap: () => setState(() => nivelSelecionado = 1),
                            child: Container(
                              width: 24, height: 24,
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(5),
                                shape: BoxShape.rectangle,
                                color: nivelSelecionado == 1 ? Colors.orangeAccent : Colors.transparent,
                                border: Border.all(color: Colors.orangeAccent, width: 2),
                              ),
                            ),
                          ),
                          const SizedBox(height: 4),
                          const Text("2", style: TextStyle(fontSize: 12, color: Colors.orangeAccent)),
                        ],
                      ),
                      const SizedBox(width: 20),

                      // --- BOTÃO 3 ---
                      Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          GestureDetector(
                            onTap: () => setState(() => nivelSelecionado = 2),
                            child: Container(
                              width: 24, height: 24,
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(5),
                                shape: BoxShape.rectangle,
                                color: nivelSelecionado == 2 ? Colors.orange : Colors.transparent,
                                border: Border.all(color: Colors.orange, width: 2),
                              ),
                            ),
                          ),
                          const SizedBox(height: 4),
                          const Text("3", style: TextStyle(fontSize: 12, color: Colors.orange)),
                        ],
                      ),
                      const SizedBox(width: 20),

                      // --- BOTÃO 4 ---
                      Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          GestureDetector(
                            onTap: () => setState(() => nivelSelecionado = 3),
                            child: Container(
                              width: 24, height: 24,
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(5),
                                shape: BoxShape.rectangle,
                                color: nivelSelecionado == 3 ? Colors.deepOrange : Colors.transparent,
                                border: Border.all(color: Colors.deepOrange, width: 2),
                              ),
                            ),
                          ),
                          const SizedBox(height: 4),
                          const Text("4", style: TextStyle(fontSize: 12, color: Colors.deepOrange)),
                        ],

                      ),
                      const SizedBox(width: 20),
                      Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          GestureDetector(
                            onTap: () => setState(() => nivelSelecionado = 4),
                            child: Container(
                              width: 24, height: 24,
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(5),
                                shape: BoxShape.rectangle,
                                color: nivelSelecionado == 4 ? Colors.red : Colors.transparent,
                                border: Border.all(color: Colors.red, width: 2),
                              ),
                            ),
                          ),
                          const SizedBox(height: 4),
                          const Text("5", style: TextStyle(fontSize: 12, color: Colors.red)),
                        ],
                      ),

                    ], // FIM DOS CHILDREN DA ROW
                  ), // FIM DA ROW
                  Text(
                    'Escolha o local do desastre:',
                    style: TextStyle(

                      fontSize: 20,
                      fontWeight: FontWeight.bold,

                      color: Colors.black54,

                    ),
                  ),

                ],

              ),

      )

            ),
          ),

        ],
      ),
    );
  }
}