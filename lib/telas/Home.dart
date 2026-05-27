import 'package:branch1/telas/cadastro_tela.dart';
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'exportador_import.dart';

class Home extends StatefulWidget {
  const Home({
    super.key,
    required this.title,
  });

  final String title;

  @override
  State<Home> createState() => _Home_State();
}

class _Home_State extends State<Home> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Stack(
          children: [
            Container(
              width: double.infinity,
              height: double.infinity,

              decoration: BoxDecoration(),

              child: Column(
                mainAxisSize: MainAxisSize.max,
                verticalDirection: VerticalDirection.up,

                children: [
                  /*Container(
                width: double.infinity,
                height: 90,
                decoration: BoxDecoration(color: Color.fromRGBO(9, 22, 46, 1)),

                child: Row(
                  mainAxisSize: MainAxisSize.max,
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,

                  children: [
                    InkWell(
                      borderRadius: BorderRadius.circular(30),
                      onTap: () {},

                      child: SvgPicture.asset(
                        'gfx/svg/icons/btn_menu_alerta.svg',
                        width: 75,

                        colorFilter: ColorFilter.mode(
                          Color.fromRGBO(138, 179, 255, 1),
                          BlendMode.srcIn,
                        ),
                      ),
                    ),
                    InkWell(
                      borderRadius: BorderRadius.circular(30),
                      onTap: () {},

                      child: SvgPicture.asset(
                        'gfx/svg/icons/btn_menu_mapa.svg',
                        width: 75,
                      ),
                    ),
                    InkWell(
                      borderRadius: BorderRadius.circular(30),
                      onTap: () {},

                      child: SvgPicture.asset(
                        'gfx/svg/icons/btn_menu_report.svg',
                        width: 75,
                      ),
                    ),
                    InkWell(
                      borderRadius: BorderRadius.circular(30),
                      onTap: () {},

                      child: SvgPicture.asset(
                        'gfx/svg/icons/btn_menu_clima.svg',
                        width: 75,
                      ),
                    ),
                  ],
                ),
              ),*/
                  SingleChildScrollView(
                    child: Container(
                      width: double.infinity,
                      padding: EdgeInsets.fromLTRB(0, 30, 0, 0),

                      decoration: BoxDecoration(
                        //color: Colors.grey
                      ),
                      child: Column(
                        children: [
                          Container(
                            width: double.infinity,
                            alignment: Alignment.center,
                            child: Text(
                              "Precisa de ajuda de",
                              style: TextStyle(
                                fontSize: 34,
                                fontWeight: FontWeight.bold,
                                color: Color.fromRGBO(9, 22, 46, 1),
                              ),
                            ),
                          ),
                          Container(
                            width: double.infinity,
                            alignment: Alignment.center,
                            child: Text(
                              "emergência?",
                              style: TextStyle(
                                fontSize: 34,
                                fontWeight: FontWeight.bold,
                                color: Color.fromRGBO(9, 22, 46, 1),
                              ),
                            ),
                          ),
                          Container(
                            width: double.infinity,
                            alignment: Alignment.center,
                            child: Text(
                              "Pressione o botão abaixo para acioná-la",
                              style: TextStyle(
                                fontSize: 18,
                                color: Color.fromRGBO(68, 118, 155, 1),
                              ),
                            ),
                          ),
                          SizedBox(
                            height: 20,
                          ),
                          InkWell(
                            borderRadius: BorderRadius.circular(150),
                            onTap: () {},

                            child: Stack(
                              alignment: Alignment.center,
                              children: [
                                Container(
                                  width: 300,
                                  height: 300,

                                  decoration: BoxDecoration(
                                    color: Color.fromRGBO(200, 0, 0, 0.5),
                                    shape: BoxShape.circle,
                                  ),
                                ),
                                Container(
                                  width: 275,
                                  height: 275,

                                  decoration: BoxDecoration(
                                    color: Color.fromRGBO(225, 0, 0, 1),
                                    shape: BoxShape.circle,
                                  ),
                                ),
                                SvgPicture.asset(
                                  'gfx/svg/icons/btn_alert.svg',
                                  width: 225,
                                ),
                              ],
                            ),
                          ),
                          SizedBox(
                            height: 300,
                            width: double.infinity,
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Container(
              child: SizedBox(
                width: double.infinity,
                height: 100,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  mainAxisSize: MainAxisSize.max,
                  children: [
                    Material(
                      color: Colors.transparent,
                      shape: CircleBorder(),
                      child: InkWell(
                        borderRadius: BorderRadius.circular(33),
                        onTap: () {},

                        child: Container(
                          width: 65,
                          height: 65,

                          decoration: BoxDecoration(
                            color: Colors.white,
                            shape: BoxShape.circle,
                          ),

                          child: SvgPicture.asset(
                            'gfx/svg/icons/User_Icon.svg',
                            width: double.infinity,
                            height: double.infinity,
                            fit: BoxFit.cover,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
