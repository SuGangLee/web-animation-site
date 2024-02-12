// 바로 호출되는 함수 생성
(() => {
  let yOffset = 0; //window.scrollY 값 담을 변수
  let prevScrollHeight = 0; // 현재 스크롤 위치보다 이전에 위치한 스크린 섹션들의 높이의 합
  let currentScene = 0; // 현재 활성화 된 섹션
  let enterNewScene = false; //새로운 씬이 시작되는 순간 true
  let acc = 0.1;
  let delayedYOffset = 0;
  let rafId;
  let rafState;

  const sceneInfo = [
    //각 스크롤 섹션 객체 생성 -step1
    {
      //담기는 정보로는
      //0
      type: "sticky", //섹션마다 sticky 한 지 normal한 지 등 특성이 다르므로 타입 지정
      heightNum: 5, //브라우저 높이의 5배로 scrollHeight 세팅할 것임
      scrollHeight: 0, //스크롤 높이 ( 높이는 기기마다 다르므로 총 스크롤 높이의 배수로 설정할 것임)
      objs: {
        // 각 구간에 존재하는 박스(요소)를 저장 - 필요할 때 갖다 쓰게
        container: document.querySelector("#scroll-section-0"),
        messageA: document.querySelector("#scroll-section-0 .main-message.a"),
        messageB: document.querySelector("#scroll-section-0 .main-message.b"),
        messageC: document.querySelector("#scroll-section-0 .main-message.c"),
        messageD: document.querySelector("#scroll-section-0 .main-message.d"),
        canvas: document.querySelector("#video-canvas-0"),
        context: document.querySelector("#video-canvas-0").getContext("2d"),
        videoImages: [],
      },
      // step7 values : 등장과 퇴장처리할 때 필요한 액션 값 넣기
      values: {
        videoImageCount: 300, //총 비디오 개수
        imageSequence: [0, 299], // 재생될 이미지 구간
        canvas_opacity: [1, 0, { start: 0.9, end: 1 }], //부드럽게 지우기, 거의 끝에서
        //투명도 시작값, 끝 값 , 애니메이션 재생 구간
        messageA_opacity_in: [0, 1, { start: 0.1, end: 0.2 }],
        messageB_opacity_in: [0, 1, { start: 0.3, end: 0.4 }],
        messageC_opacity_in: [0, 1, { start: 0.5, end: 0.6 }],
        messageD_opacity_in: [0, 1, { start: 0.7, end: 0.8 }],
        // 문장 들어올 때 아래에서 올라오고
        messageA_translateY_in: [20, 0, { start: 0.1, end: 0.2 }],
        messageB_translateY_in: [20, 0, { start: 0.3, end: 0.4 }],
        messageC_translateY_in: [20, 0, { start: 0.5, end: 0.6 }],
        messageD_translateY_in: [20, 0, { start: 0.7, end: 0.8 }],
        //투명도 시작값, 끝 값 , 애니메이션 사라지는 구간
        messageA_opacity_out: [1, 0, { start: 0.25, end: 0.3 }],
        messageB_opacity_out: [1, 0, { start: 0.45, end: 0.5 }],
        messageC_opacity_out: [1, 0, { start: 0.65, end: 0.7 }],
        messageD_opacity_out: [1, 0, { start: 0.85, end: 0.9 }],
        // 문장 나갈때도 올라가는 효과
        messageA_translateY_out: [0, -20, { start: 0.25, end: 0.3 }],
        messageB_translateY_out: [0, -20, { start: 0.45, end: 0.5 }],
        messageC_translateY_out: [0, -20, { start: 0.65, end: 0.7 }],
        messageD_translateY_out: [0, -20, { start: 0.85, end: 0.9 }],
      },
    },
    {
      //담기는 정보로는
      //1
      type: "normal", //섹션마다 sticky 한 지 normal한 지 등 특성이 다르므로 타입 지정
      // heightNum: 5, //type normal에서는 필요 없음, 브라우저 높이의 5배로 scrollHeight 세팅할 것임
      scrollHeight: 0, //스크롤 높이 ( 높이는 기기마다 다르므로 총 스크롤 높이의 배수로 설정할 것임)
      objs: {
        //각 구간에 존재하는 박스(요소)를 저장 - 필요할 때 갖다 쓰게
        container: document.querySelector("#scroll-section-1"),
      },
    },
    {
      //담기는 정보로는
      //2
      type: "sticky", //섹션마다 sticky 한 지 normal한 지 등 특성이 다르므로 타입 지정
      heightNum: 5, //브라우저 높이의 5배로 scrollHeight 세팅할 것임
      scrollHeight: 0, //스크롤 높이 ( 높이는 기기마다 다르므로 총 스크롤 높이의 배수로 설정할 것임)
      objs: {
        //각 구간에 존재하는 박스(요소)를 저장 - 필요할 때 갖다 쓰게
        container: document.querySelector("#scroll-section-2"),
        messageA: document.querySelector("#scroll-section-2 .a"),
        messageB: document.querySelector("#scroll-section-2 .b"),
        messageC: document.querySelector("#scroll-section-2 .c"),
        pinB: document.querySelector("#scroll-section-2 .b .pin"),
        pinC: document.querySelector("#scroll-section-2 .c .pin"),
        canvas: document.querySelector("#video-canvas-1"),
        context: document.querySelector("#video-canvas-1").getContext("2d"),
        videoImages: [],
      },
      // step7 values : 등장과 퇴장처리할 때 필요한 액션 값 넣기
      values: {
        videoImageCount: 960, //총 비디오 개수
        imageSequence: [0, 959], // 재생될 이미지 구간
        canvas_opacity_in: [0, 1, { start: 0.0, end: 0.1 }], //부드럽게 나타내기, 거의 처음에서
        canvas_opacity_out: [1, 0, { start: 0.95, end: 1 }], //부드럽게 지우기, 거의 끝에서
        messageB_translateY_in: [30, 0, { start: 0.5, end: 0.55 }],
        messageC_translateY_in: [30, 0, { start: 0.72, end: 0.77 }],
        messageA_opacity_in: [0, 1, { start: 0.15, end: 0.2 }],
        messageB_opacity_in: [0, 1, { start: 0.5, end: 0.55 }],
        messageC_opacity_in: [0, 1, { start: 0.72, end: 0.77 }],
        messageA_translateY_out: [0, -20, { start: 0.3, end: 0.35 }],
        messageB_translateY_out: [0, -20, { start: 0.58, end: 0.63 }],
        messageC_translateY_out: [0, -20, { start: 0.85, end: 0.9 }],
        messageA_opacity_out: [1, 0, { start: 0.3, end: 0.35 }],
        messageB_opacity_out: [1, 0, { start: 0.58, end: 0.63 }],
        messageC_opacity_out: [1, 0, { start: 0.85, end: 0.9 }],
        pinB_scaleY: [0.5, 1, { start: 0.5, end: 0.55 }],
        pinC_scaleY: [0.5, 1, { start: 0.72, end: 0.77 }],
        pinB_opacity_in: [0, 1, { start: 0.5, end: 0.55 }],
        pinC_opacity_in: [0, 1, { start: 0.72, end: 0.77 }],
        pinB_opacity_out: [1, 0, { start: 0.58, end: 0.63 }],
        pinC_opacity_out: [1, 0, { start: 0.85, end: 0.9 }],
      },
    },
    {
      //담기는 정보로는
      //3
      type: "sticky", //섹션마다 sticky 한 지 normal한 지 등 특성이 다르므로 타입 지정
      heightNum: 5, //브라우저 높이의 5배로 scrollHeight 세팅할 것임
      scrollHeight: 0, //스크롤 높이 ( 높이는 기기마다 다르므로 총 스크롤 높이의 배수로 설정할 것임)
      objs: {
        container: document.querySelector("#scroll-section-3"),
        canvasCaption: document.querySelector(".canvas-caption"),
        canvas: document.querySelector(".image-blend-canvas"),
        context: document.querySelector(".image-blend-canvas").getContext("2d"),
        imagesPath: [
          "./images/blend-image-1.jpg",
          "./images/blend-image-2.jpg",
        ],
        images: [],
      },
      values: {
        rect1X: [0, 0, { start: 0, end: 0 }],
        rect2X: [0, 0, { start: 0, end: 0 }],
        rectStartY: 0,
        blendHeight: [0, 0, { start: 0, end: 0 }],
        canvas_scale: [0, 0, { start: 0, end: 0 }],
        canvasCaption_opacity: [0, 1, { start: 0, end: 0 }],
        canvasCaption_translateY: [20, 0, { start: 0, end: 0 }],
      },
    },
  ];

  function setLayout() {
    //step2
    //sceneInfo 를 돌면서 4구간의 scrollHeight를 셋팅 -
    // 총 스크롤 길이가 길어지는 효과 ( 각 구간마다 heightNum만큼의 스크롤 구간을 가지게 됨)
    // 생성한 스크롤 높이를 html에 실제 스크롤 높이로 설정하는 과정 필요
    // 컨테이너 정보 담고있는 obs 객체에 style.height로 높이 설정

    // step 10
    // 각 섹션의 타입에 따라 높이 세팅 수정
    for (let i = 0; i < sceneInfo.length; i++) {
      if (sceneInfo[i].type === "sticky") {
        sceneInfo[i].scrollHeight = sceneInfo[i].heightNum * window.innerHeight;
        sceneInfo[
          i
        ].objs.container.style.height = `${sceneInfo[i].scrollHeight}px`;
      } else if (sceneInfo[i].type === "normal") {
        sceneInfo[i].scrollHeight = sceneInfo[i].objs.container.offsetHeight;
        sceneInfo[
          i
        ].objs.container.style.height = `${sceneInfo[i].scrollHeight}px`;
      }
    }

    //step6. currentScene 자동세팅 (새로고침시에도 스크롤 섹션 정보 정확히 하기 이ㅜ해서)
    let totalScrollHeight = 0;
    for (let i = 0; i < sceneInfo.length; i++) {
      totalScrollHeight += sceneInfo[i].scrollHeight;
      if (totalScrollHeight >= scrollY) {
        //현재 높이가 섹션 높이보다 높으면 , 현재 스크롤 번호 부여 후 탈출
        currentScene = i;

        break;
      }
    }
    //바디 태그에 아이디 줘서 현재 스크롤 요소 띄우기
    document.body.setAttribute("id", `scene-${currentScene}`);

    //비디오 이미지 크기 조절, 중앙 위치
    const heightRatio = window.innerHeight / 1080;
    sceneInfo[0].objs.canvas.style.transform = `translate3d(-50%,-50%,0) scale(${heightRatio})`;
    sceneInfo[2].objs.canvas.style.transform = `translate3d(-50%,-50%,0) scale(${heightRatio})`;
  }

  // step 9 현재 스크롤 위치에 따라 각 메세지의 값을 조정하기 위한 계산함수
  //매개변수로 시작값과 끝 값, 첫번째 신 내에서 현재 스크롤된 정도(비율) 필요
  function calcValues(values, currentYOffset) {
    let rv;
    const scrollHeight = sceneInfo[currentScene].scrollHeight;
    const scrollRatio = currentYOffset / scrollHeight; //비율값 (현재 씬 내부 스크롤된 높이 / 현재 씬 전체 높이)
    if (values.length === 3) {
      //start~end 사이에 애니메이션 실행
      //시작 pixel, 끝 pixel
      const partScrollStart = values[2].start * scrollHeight; // 씬의 높이 의  0배율된  값(0)
      const partScrollEnd = values[2].end * scrollHeight; //씬의 높이 의  1배율 값 (스크롤 높이 값)
      const partScrollHeight = partScrollEnd - partScrollStart;

      //현재 위치가 메세지 구간에 도달하지 않았거나(start보다 작고) 넘었을 경우(end보다 크면), value는 초기 / 끝 값으로 설정
      if (
        currentYOffset >= partScrollStart &&
        currentYOffset <= partScrollEnd
      ) {
        rv =
          ((currentYOffset - partScrollStart) / partScrollHeight) *
            (values[1] - values[0]) +
          values[0];
      } else if (currentYOffset < partScrollStart) {
        rv = values[0];
      } else if (currentYOffset > partScrollStart) {
        rv = values[1];
      }
    } else {
      // scrollRatio * 전체 범위 (끝 값 - 시작 값) + 시작값(초기값)
      rv = scrollRatio * (values[1] - values[0]) + values[0];
    }

    return rv;
  }

  //step 8 애니메이션 처리 함수 , 현재 씬에 해당하는 요소들만 애니메이션 처리
  function playAnimation() {
    //현재 씬에 따라 분기처리
    const values = sceneInfo[currentScene].values;
    const objs = sceneInfo[currentScene].objs;
    // 현재 신 내에서 현재 스크롤된 정도(비율) 구하기 : 현재 스크롤 위치 값(yOffset) - 이전 씬들의 높이 합 (prevScrollHeight)
    //즉, 씬이 넘어갈 때 0 됨
    const currentYOffset = yOffset - prevScrollHeight;
    // 얼마나 스크롤 되었는지 (yOffset-prevScrollHeight) / 현재 씬의 전체 스크롤 범위
    const scrollHeight = sceneInfo[currentScene].scrollHeight;
    const scrollRatio = currentYOffset / scrollHeight;

    switch (currentScene) {
      case 0:
        // let sequence = Math.round(
        //   calcValues(values.imageSequence, currentYOffset)
        // );
        // objs.context.drawImage(objs.videoImages[sequence], 0, 0);

        objs.canvas.style.opacity = calcValues(
          values.canvas_opacity,
          currentYOffset
        );

        if (scrollRatio <= 0.22) {
          // in

          objs.messageA.style.opacity = calcValues(
            values.messageA_opacity_in,
            currentYOffset
          );

          objs.messageA.style.transform = `translate3d(0, ${calcValues(
            values.messageA_translateY_in,
            currentYOffset
          )}%, 0)`;
        } else {
          // out
          objs.messageA.style.opacity = calcValues(
            values.messageA_opacity_out,
            currentYOffset
          );

          objs.messageA.style.transform = `translate3d(0, ${calcValues(
            values.messageA_translateY_out,
            currentYOffset
          )}%, 0)`;
        }
        if (scrollRatio <= 0.42) {
          // in

          objs.messageB.style.opacity = calcValues(
            values.messageB_opacity_in,
            currentYOffset
          );
          objs.messageB.style.transform = `translate3d(0, ${calcValues(
            values.messageB_translateY_in,
            currentYOffset
          )}%, 0)`;
        } else {
          // out
          objs.messageB.style.opacity = calcValues(
            values.messageB_opacity_out,
            currentYOffset
          );
          objs.messageB.style.transform = `translate3d(0, ${calcValues(
            values.messageB_translateY_out,
            currentYOffset
          )}%, 0)`;
        }

        if (scrollRatio <= 0.62) {
          // in

          objs.messageC.style.opacity = calcValues(
            values.messageC_opacity_in,
            currentYOffset
          );
          objs.messageC.style.transform = `translate3d(0, ${calcValues(
            values.messageC_translateY_in,
            currentYOffset
          )}%, 0)`;
        } else {
          // out
          objs.messageC.style.opacity = calcValues(
            values.messageC_opacity_out,
            currentYOffset
          );
          objs.messageC.style.transform = `translate3d(0, ${calcValues(
            values.messageC_translateY_out,
            currentYOffset
          )}%, 0)`;
        }

        if (scrollRatio <= 0.82) {
          // in
          objs.messageD.style.opacity = calcValues(
            values.messageD_opacity_in,
            currentYOffset
          );
          objs.messageD.style.transform = `translate3d(0, ${calcValues(
            values.messageD_translateY_in,
            currentYOffset
          )}%, 0)`;
        } else {
          // out
          objs.messageD.style.opacity = calcValues(
            values.messageD_opacity_out,
            currentYOffset
          );
          objs.messageD.style.transform = `translate3d(0, ${calcValues(
            values.messageD_translateY_out,
            currentYOffset
          )}%, 0)`;
        }

        break;
      case 2:
        // let sequence2 = Math.round(
        //   calcValues(values.imageSequence, currentYOffset)
        // );

        // objs.context.drawImage(objs.videoImages[sequence2], 0, 0);

        //등장 시 이미지 애니메이션 천천히 등장
        if (scrollRatio <= 0.5) {
          objs.canvas.style.opacity = calcValues(
            values.canvas_opacity_in,
            currentYOffset
          );
        } else {
          //퇴장
          objs.canvas.style.opacity = calcValues(
            values.canvas_opacity_out,
            currentYOffset
          );
        }

        if (scrollRatio <= 0.25) {
          // in

          objs.messageA.style.opacity = calcValues(
            values.messageA_opacity_in,
            currentYOffset
          );
          objs.messageA.style.transform = `translate3d(0, ${calcValues(
            values.messageA_translateY_in,
            currentYOffset
          )}%, 0)`;
        } else {
          // out
          objs.messageA.style.opacity = calcValues(
            values.messageA_opacity_out,
            currentYOffset
          );
          objs.messageA.style.transform = `translate3d(0, ${calcValues(
            values.messageA_translateY_out,
            currentYOffset
          )}%, 0)`;
        }

        if (scrollRatio <= 0.57) {
          // in

          objs.messageB.style.transform = `translate3d(0, ${calcValues(
            values.messageB_translateY_in,
            currentYOffset
          )}%, 0)`;
          objs.messageB.style.opacity = calcValues(
            values.messageB_opacity_in,
            currentYOffset
          );

          objs.pinB.style.transform = `scaleY(${calcValues(
            values.pinB_scaleY,
            currentYOffset
          )})`;
        } else {
          // out
          objs.messageB.style.transform = `translate3d(0, ${calcValues(
            values.messageB_translateY_out,
            currentYOffset
          )}%, 0)`;
          objs.messageB.style.opacity = calcValues(
            values.messageB_opacity_out,
            currentYOffset
          );
          objs.pinB.style.transform = `scaleY(${calcValues(
            values.pinB_scaleY,
            currentYOffset
          )})`;
        }

        if (scrollRatio <= 0.83) {
          // in
          objs.messageC.style.transform = `translate3d(0, ${calcValues(
            values.messageC_translateY_in,
            currentYOffset
          )}%, 0)`;
          objs.messageC.style.opacity = calcValues(
            values.messageC_opacity_in,
            currentYOffset
          );
          objs.pinC.style.transform = `scaleY(${calcValues(
            values.pinC_scaleY,
            currentYOffset
          )})`;
        } else {
          // out
          objs.messageC.style.transform = `translate3d(0, ${calcValues(
            values.messageC_translateY_out,
            currentYOffset
          )}%, 0)`;
          objs.messageC.style.opacity = calcValues(
            values.messageC_opacity_out,
            currentYOffset
          );
          objs.pinC.style.transform = `scaleY(${calcValues(
            values.pinC_scaleY,
            currentYOffset
          )})`;
        }

        //currentScene 3에서 쓰는 캔버스 미리 그려주기 시작
        if (scrollRatio > 0.9) {
          //case3번 코드 복붙 , 수정 + Obj,values 재 설정
          // 애니메이션 줄 거 아니니까 애니메이션 처리 부분 지움
          const objs = sceneInfo[3].objs;
          const values = sceneInfo[3].values;

          // console.log('3 play');
          // 가로(폭), 세로(높이) 모두 꽉차게 하기 위한 계산
          const widthRatio = window.innerWidth / objs.canvas.width;
          const heightRatio = window.innerHeight / objs.canvas.height;
          let canvasScaleRatio; //캔버스 크기 조절 변수
          //가로세로 비율에 따라 캔버스 크기 조절함

          if (widthRatio <= heightRatio) {
            //높이가 더 크면 높이에 맞춰 크기 조절하고
            canvasScaleRatio = heightRatio;
          } else {
            //폭이 더 크면 폭에 맞춰 크기 조절함
            canvasScaleRatio = widthRatio;
          }

          objs.canvas.style.transform = `scale(${canvasScaleRatio})`;
          objs.context.drawImage(objs.images[0], 0, 0);
          objs.context.fillStyle = "white"; // 박스 하얀색으로 칠하기

          //창사이즈를 캔버스(이미지)비율에 맞춰 다시 계산
          const recalculatedInnerWidth = window.innerWidth / canvasScaleRatio;
          const recalculatedInnerHeight = window.innerHeight / canvasScaleRatio;

          //하얀 박스 폭 , 창의 15%, 박스의 x좌표 구하는 부분은 필요
          const whiteRectWidth = recalculatedInnerWidth * 0.15;
          //좌우 흰색 박스가 위치할 시작값, 최종값 설정 (노션으로 이해)
          values.rect1X[0] = (objs.canvas.width - recalculatedInnerWidth) / 2;
          values.rect1X[1] = values.rect1X[0] - whiteRectWidth;
          values.rect2X[0] =
            values.rect1X[0] + recalculatedInnerWidth - whiteRectWidth;
          values.rect2X[1] = values.rect2X[0] + whiteRectWidth;

          //좌우 흰색 박스 그리기
          objs.context.fillRect(
            parseInt(values.rect1X[0]), // 애니메이션 없음, 고정값
            0,
            parseInt(whiteRectWidth),
            objs.canvas.height
          ); // x,y,width,height
          objs.context.fillRect(
            parseInt(values.rect2X[0]), // 애니메이션 없음, 고정값
            0,
            parseInt(whiteRectWidth),
            objs.canvas.height
          ); // x,y,width,height
        }

        break;

      case 3:
        // console.log('3 play');
        // 가로(폭), 세로(높이) 모두 꽉차게 하기 위한 계산
        const widthRatio = window.innerWidth / objs.canvas.width;
        const heightRatio = window.innerHeight / objs.canvas.height;
        let canvasScaleRatio; //캔버스 크기 조절 변수
        //가로세로 비율에 따라 캔버스 크기 조절함

        if (widthRatio <= heightRatio) {
          //높이가 더 크면 높이에 맞춰 크기 조절하고
          canvasScaleRatio = heightRatio;
        } else {
          //폭이 더 크면 폭에 맞춰 크기 조절함
          canvasScaleRatio = widthRatio;
        }

        objs.canvas.style.transform = `scale(${canvasScaleRatio})`;
        objs.context.drawImage(objs.images[0], 0, 0);
        objs.context.fillStyle = "white"; // 박스 하얀색으로 칠하기

        //창사이즈를 캔버스(이미지)비율에 맞춰 다시 계산
        const recalculatedInnerWidth = window.innerWidth / canvasScaleRatio;
        const recalculatedInnerHeight = window.innerHeight / canvasScaleRatio;

        // objs.canvas.getBoundingClientRect();

        //애니메이션 시점 정하기
        if (!values.rectStartY) {
          // 애니메이션이 시작될 y위치가 정해지지 않았다면, 시작 위치 구하기 : ( 원래 캔버스 길이 - 조정된 캔버스 길이 ) /2
          values.rectStartY =
            objs.canvas.offsetTop +
            (objs.canvas.height - canvasScaleRatio * objs.canvas.height) / 2;

          // 예를 들어, 시작이 500px고 섹션 높이가 1000px면 end비율은 0.5잖아.
          //그럼 500px에서 500px더 스크롤하먄 애니메이션 종료 = 캔버스 화면에 다 참

          // 애니메이션이 시작될 비율 (캔버스의 절반부터 실행)
          values.rect1X[2].start = window.innerHeight / 2 / scrollHeight;
          values.rect2X[2].start = window.innerHeight / 2 / scrollHeight;
          // 애니메이션이 끝나는 지점
          values.rect1X[2].end = values.rectStartY / scrollHeight;
          values.rect2X[2].end = values.rectStartY / scrollHeight;
        }

        //하얀 박스 폭 , 창의 15%
        const whiteRectWidth = recalculatedInnerWidth * 0.15;
        //좌우 흰색 박스가 위치할 시작값, 최종값 설정 (노션으로 이해)
        values.rect1X[0] = (objs.canvas.width - recalculatedInnerWidth) / 2;
        values.rect1X[1] = values.rect1X[0] - whiteRectWidth;
        values.rect2X[0] =
          values.rect1X[0] + recalculatedInnerWidth - whiteRectWidth;
        values.rect2X[1] = values.rect2X[0] + whiteRectWidth;

        //좌우 흰색 박스 그리기
        objs.context.fillRect(
          parseInt(calcValues(values.rect1X, currentYOffset)),
          0,
          parseInt(whiteRectWidth),
          objs.canvas.height
        ); // x,y,width,height
        objs.context.fillRect(
          parseInt(calcValues(values.rect2X, currentYOffset)),
          0,
          parseInt(whiteRectWidth),
          objs.canvas.height
        ); // x,y,width,height

        if (scrollRatio < values.rect2X[2].end) {
          //캔버스1이 꽉차지 않았다면
          step = 1;
          objs.canvas.classList.remove("sticky"); //클래스 제거
        } else {
          //이미지 블랜드
          step = 2;
          values.blendHeight[0] = 0;
          values.blendHeight[1] = objs.canvas.height;
          values.blendHeight[2].start = values.rect2X[2].end; // 캔버스 1꽉 찼을 때, 애니메이션 시작
          values.blendHeight[2].end = values.blendHeight[2].start + 0.2; // end를 크게 잡으면 스크롤을 많이하니, 시간이 느려짐 반대도 마찬가지

          objs.canvas.classList.add("sticky"); //클래스 붙임
          //top 위치 계산, 캔버스의 조정된 높이만큼 빼준다.
          objs.canvas.style.top = `${
            ((objs.canvas.height - canvasScaleRatio * objs.canvas.height) / 2) *
            -1
          }px`;

          // 이미지2 줄어들기 시작하는 if문
          if (scrollRatio > values.blendHeight[2].end) {
            //크기 조정 값 설정
            values.canvas_scale[0] = canvasScaleRatio;
            //축소 최종 값, 기준을 브라우저의 폭으로 잡게끔 해야한다.
            values.canvas_scale[1] =
              document.body.offsetWidth / (objs.canvas.width * 1.5);

            //2번째 이미지가 꽉찼을 때부터 줄어들기 시작
            values.canvas_scale[2].start = values.blendHeight[2].end;
            // 어느정도 스크롤까지 이미지 줄어들게 할 지 (20%) -> 이미지 블렌드 되고 줄어드는 것까지 섹션3의 40%를 차지함
            values.canvas_scale[2].end = values.canvas_scale[2].start + 0.2;

            objs.canvas.style.transform = `scale(${calcValues(
              values.canvas_scale,
              currentYOffset
            )})`;
            objs.canvas.style.marginTop = 0; // 다시 올라갈때 이미지 보이게 하기
          }

          //값이 세팅되고, 이미지2 다 축소되면
          if (
            values.canvas_scale[2].end > 0 &&
            scrollRatio > values.canvas_scale[2].end
          ) {
            objs.canvas.classList.remove("sticky");
            // 이미지가 원하는 만큼 축소되었을 때, position이 fixed에서 static으로 바뀌어야한다. (여기선 sticky 클래스 제거 )
            // 그 순간, 이미지는 더이상 fixed가 아니기 때문에 완전 위로 올라가버린다.
            // 이를 방지하고, 눈에 계속 보이게 하기 위해 margin-top을 줘서 위치를 그대로 냅두며 해결한다.
            //섹션3의 40%를 차지함 즉, 스크롤 높이의 0.4배
            objs.canvas.style.marginTop = `${scrollHeight * 0.4}px`;

            //투명도 : 이미지 축소가 완료된 시점에 텍스트 애니메이션 시작, 10% 스크롤 후 종료
            values.canvasCaption_opacity[2].start = values.canvas_scale[2].end;
            values.canvasCaption_opacity[2].end =
              values.canvasCaption_opacity[2].start + 0.1;
            objs.canvasCaption.style.opacity = `${calcValues(
              values.canvasCaption_opacity,
              currentYOffset
            )}`;

            //Y위치  : 이미지 축소가 완료된 시점에 텍스트 애니메이션 시작, 10% 스크롤 후 종료
            values.canvasCaption_translateY[2].start =
              values.canvas_scale[2].end;
            values.canvasCaption_translateY[2].end =
              objs.canvasCaption.style.transform = `translate3d(0,${calcValues(
                values.canvasCaption_translateY,
                currentYOffset
              )}%,0) `;
          }

          // 새로 그릴 이미지 높이 계산
          const blendHeight = calcValues(values.blendHeight, currentYOffset);
          // 캔버스사이즈와 이미지 사이즈 같아서 숫자바뀰 필요 X
          objs.context.drawImage(
            objs.images[1],
            0, //sx
            objs.canvas.height - blendHeight, //sy
            objs.canvas.width, //sWidth
            blendHeight, //sHeight
            0, //dx
            objs.canvas.height - blendHeight, //dy
            objs.canvas.width, //dWidth
            blendHeight //dHeight
          );
        }
        break;
    }
  }

  //step 5 : scrollLoop()  //활성화 시킬 씬 번호 선택
  function scrollLoop() {
    prevScrollHeight = 0;
    enterNewScene = false;
    for (let i = 0; i < currentScene; i++) {
      prevScrollHeight += sceneInfo[i].scrollHeight;
    }

    //스크롤 이벤트가 필요한 범위
    if (
      delayedYOffset <
      prevScrollHeight + sceneInfo[currentScene].scrollHeight
    ) {
      document.body.classList.remove("scroll-effect-end");
    }
    // 스크롤 내릴 때
    if (
      delayedYOffset >
      prevScrollHeight + sceneInfo[currentScene].scrollHeight
    ) {
      enterNewScene = true;
      if (currentScene == sceneInfo.length - 1) {
        document.body.classList.add("scroll-effect-end");
      }
      if (currentScene < sceneInfo.length - 1) {
        currentScene++;
      }

      //바디 태그에 아이디 줘서 현재 스크롤 요소 띄우기
      document.body.setAttribute("id", `scene-${currentScene}`);
      if (enterNewScene) return;
    }
    // 스크롤 올릴 때
    if (delayedYOffset < prevScrollHeight) {
      enterNewScene = true;

      currentScene--;
      //바디 태그에 아이디 줘서 현재 스크롤 요소 띄우기
      document.body.setAttribute("id", `scene-${currentScene}`);
    }

    //step 8
    if (enterNewScene) return; // 씬이 변경되는 찰나의 순간에는 값 계산 X -> 이상한 값 막음
    playAnimation();
  }

  function setCanvasImage() {
    //이미지 셋팅
    let imgElem;

    for (let i = 0; i < sceneInfo[0].values.videoImageCount; i++) {
      imgElem = new Image();
      imgElem.src = `./video/001/IMG_${6726 + i}.JPG`;
      sceneInfo[0].objs.videoImages.push(imgElem);
    }
    let imgElem2;

    for (let i = 0; i < sceneInfo[2].values.videoImageCount; i++) {
      imgElem2 = new Image();
      imgElem2.src = `./video/002/IMG_${7027 + i}.JPG`;
      sceneInfo[2].objs.videoImages.push(imgElem2);
    }

    let blendImage;
    for (let i = 0; i < sceneInfo[3].objs.imagesPath.length; i++) {
      blendImage = new Image();
      blendImage.src = sceneInfo[3].objs.imagesPath[i];
      sceneInfo[3].objs.images.push(blendImage);
    }
  }

  function checkMenu(yOffset) {
    //yOffset = 문서 전체에서 스크롤 된 위치에 따라 메뉴 블러처리
    if (yOffset > 44) {
      //첫째 메뉴 높이 = 44
      document.body.classList.add("local-nav-sticky");
    } else {
      document.body.classList.remove("local-nav-sticky");
    }
  }

  function loop() {
    //비디오 부드러운 처리
    //새로운 식, 가속도가 적용된 yOffset = delayedYOffset
    delayedYOffset = delayedYOffset + (yOffset - delayedYOffset) * acc;

    if (!enterNewScene) {
      //false일 때 실행, 씬이 바뀌지 않는 순간일 때

      if (currentScene === 0 || currentScene === 2) {
        const currentYOffset = delayedYOffset - prevScrollHeight; // 가속도 적용 yoffset
        const objs = sceneInfo[currentScene].objs;
        const values = sceneInfo[currentScene].values;

        let sequence = Math.round(
          calcValues(values.imageSequence, currentYOffset)
        );
        if (objs.videoImages[sequence]) {
          //있을때만 그려주기
          objs.context.drawImage(objs.videoImages[sequence], 0, 0);
        }
      }
    }

    rafId = requestAnimationFrame(loop); //무한 반복

    if (Math.abs(delayedYOffset - yOffset) < 1) {
      //목표한 위치(스크롤이 멈춘 위치) 면 loop종료
      cancelAnimationFrame(rafId);
      rafState = false;
    }
  }

  // 모바일 기기를 가로/세로 모드 전환할 때 layout 재지정
  window.addEventListener("orientationchange", () => {
    scrollTo(0, 0);
    setTimeout(() => {
      window.location.reload();
    }, 500); //0.5s
  });

  //비디오 같은 이미지들이 먼저 로드된 후 스크립트 실행 -> 보이는 게 없는데, 기능만 실행돼봤자 의미 X
  window.addEventListener("load", () => {
    document.body.classList.remove("before-load");

    setLayout();
    //로드 했을 때, 첫번째 이미지 그려주면됨

    sceneInfo[0].objs.context.drawImage(sceneInfo[0].objs.videoImages[0], 0, 0);

    // 조금씩 단계적으로 빠르게 움직여서 부드럽게 스크롤 발생시키기
    let tempYoffset = yOffset;
    let tempScrollCount = 0;
    if (yOffset > 0) {
      let siid = setInterval(() => {
        //x,y px만큼 x,y위치로 스크롤 , 시간차로 지연을 줘서 실행
        window.scrollTo(0, tempYoffset);
        tempYoffset += 1;
        tempScrollCount++;
        if (tempScrollCount >= 20) {
          clearInterval(siid);
        }
      }, 20); //0.02초
    }
    //로드 했을 때, scene 2의  1번째 이미지 그려주면됨

    sceneInfo[2].objs.context.drawImage(sceneInfo[2].objs.videoImages[0], 0, 0);

    // 로드 된 후 스크롤 이벤트 동작
    window.addEventListener("scroll", () => {
      yOffset = window.scrollY;

      scrollLoop();
      checkMenu(yOffset);

      if (!rafState) {
        //부정의 부정 -> 참 , 즉, 스크롤이 다시 발생하면
        rafId = requestAnimationFrame(loop); //이어서 loop 실행
        rafState = true;
      }
    });

    //step3
    // 모바일 사이즈 보다 커질 때 , //윈도우 사이즈 변할 때 코드 실행
    window.addEventListener("resize", () => {
      if (innerWidth > 900) {
        window.location.reload();
      }
    });

    document.querySelector(".loading").addEventListener("transtionend", () => {
      document.body.removeChild();
    });
  });

  //step 4 :스크롤 이벤트 등록

  setCanvasImage();
})();

//heightNum을 이용해서 스크롤 총 높이를 세팅할 것이다.
