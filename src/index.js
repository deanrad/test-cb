import "./styles.css";
import { GameLoop, app } from "rx-helper";
import { fromEvent } from "rxjs";
import { scan } from "rxjs/operators";

const canvas = document.getElementById("c");
const context = canvas.getContext("2d");
context.fillStyle = "red";

const width = 70;

const drawKitt = pos => {
  const fromX = 5 + pos * 4;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillRect(fromX, 0, 10, canvas.height);
};

const block = (ms = 200) => {
  const orig = performance.now();
  let loopCount = 0;
  while (performance.now() - orig < ms && loopCount < 10000) {
    loopCount++;
  }
};

const frames = new GameLoop();
const animationPeriod = 3000;

app.on("frame", ({ action }) => {
  const { delta } = action.payload;
  const phase = (delta % animationPeriod) / animationPeriod;
  const pos = 2 * width * (phase < 0.5 ? phase : 1 - phase);
  drawKitt(pos);
});

app.subscribe(frames, "frame");

// block in proportion to mousemovement
fromEvent(document, "mousemove")
  .pipe(
    scan((lastX, { clientX }) => {
      const diff = Math.abs(clientX - lastX);
      console.log({ diff });
      block(diff * 10);
      return clientX;
    }, 0)
  )
  .subscribe({
    error(e) {
      console.error(e);
    }
  });

document.getElementById("app").innerHTML = `
<h1>Rx-Helper provides a GameLoop!</h1>
<div>
  Game Loops, which use requestAnimationFrame to 
  execute code as smoothly as possible, are typically tricky
  to write, as they rely upon recursive function calling.

</div>
<div>
  Here we package the recursion into an Observable, upon
  which you can hang your logic. The canvas below will 
  move at the maximum refresh rate possible for your monitor,
  unless slowed down by your mouse (the more you move it the
  more blocking computation is added to slow down the framerate.)
</div>
<div>
  The usefulness of the Game Loop is that even if frames are dropped,
  the overall pacing of the animation will remain the same (${animationPeriod} msec).
</div>
`;
