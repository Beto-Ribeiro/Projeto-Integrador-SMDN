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
  Future<void> selecionarImagem() async {
    final resultado =
    await FilePicker.platform.pickFiles(
      type: FileType.image,
    );

    if (resultado != null) {
      setState(() {
        imagemSelecionada = File(
          resultado.files.single.path!,
        );
      });
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
                    'Informe as informações para reportar',
                    style: TextStyle(

                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                      color: Colors.black,
                    ),
                  ),
                  Text(
                    'Insira uma Imagem'
                  ),
                  GestureDetector(
                    onTap: selecionarImagem,
                    child: Container(
                      width: double.infinity,
                      height: 120,

                      decoration: BoxDecoration(
                        border: Border.all(
                          color: Colors.black54,
                        ),
                        borderRadius: BorderRadius.circular(4),
                      ),

                      child: imagemSelecionada == null
                          ? const Align(
                        alignment: Alignment.topLeft,
                        child: Padding(
                          padding: EdgeInsets.all(8),
                          child: Text(
                            'Insira uma imagem',
                          ),
                        ),
                      )
                          : ClipRRect(
                        borderRadius:
                        BorderRadius.circular(4),
                        child: Image.file(
                          imagemSelecionada!,
                          fit: BoxFit.cover,
                        ),
                      ),
                    ),
                  )
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