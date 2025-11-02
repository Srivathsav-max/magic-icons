export type Point = { x: number; y: number };

export type Path = {
	d: string;
	prev: Point;
	next: Point;
	isStart: boolean;
	circle?: {
		x: number;
		y: number;
		r: number;
		tangentIntersection?: Point;
	};
	cp1?: Point;
	cp2?: Point;
	c: {
		id: number;
		idx: number;
		type: number;
		x?: number;
		y?: number;
		x1?: number;
		y1?: number;
		x2?: number;
		y2?: number;
		rX?: number;
		rY?: number;
		xRot?: number;
		lArcFlag?: number;
		sweepFlag?: number;
		relative?: boolean;
		[key: string]: unknown;
	};
};
