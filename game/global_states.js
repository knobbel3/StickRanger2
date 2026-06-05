export let CanvasState = {
    element : document.getElementById("cv"),
    canvasImage: undefined,
    canvasBuffer: undefined,

};

CanvasState.context2d = CanvasState.element.getContext("2d");
CanvasState.canvasImage = CanvasState.context2d.createImageData(640, 432);
CanvasState.canvasImage = CanvasState.context2d.createImageData(640, 432);
CanvasState.canvasBuffer = new Uint32Array(CanvasState.canvasImage.data.buffer);

export let SaveState = {
    userSaveCode : undefined, // ca
    userSaveKey : [0, 0, 0, 0, 0, 0, 0, 0], // da
};
