import { DonutSlice } from './types';

// https://dev.to/mustapha/how-to-create-an-interactive-svg-donut-chart-using-angular-19eo

export interface DonutSliceWithCommands extends DonutSlice {
    offset: number; // This is the offset that we will use to rotate the slices
    commands: string; // This will be what goes inside the d attribute of the path tag
}


class CalculusHelper {
    getSlicesWithCommandsAndOffsets(
        donutSlices: DonutSlice[],
        radius: number,
        svgSize: number,
        borderSize: number
    ): DonutSliceWithCommands[] {
        let previousPercent = 0;
        return donutSlices.map((slice) => {
            const sliceWithCommands: DonutSliceWithCommands = {
                ...slice,
                commands: this.getSliceCommands(slice, radius, svgSize, borderSize),
                offset: previousPercent * 3.6 * -1,
            };
            previousPercent += slice.percent;
            return sliceWithCommands;
        });
    }

    getSliceCommands(
        donutSlice: DonutSlice,
        radius: number,
        svgSize: number,
        borderSize: number
    ): string {
        const degrees = this.percentToDegrees(donutSlice.percent);
        const longPathFlag = degrees > 180 ? 1 : 0;
        const innerRadius = radius - borderSize;

        const commands: string[] = [];
        commands.push(`M ${svgSize / 2 + radius} ${svgSize / 2}`);
        commands.push(
            `A ${radius} ${radius} 0 ${longPathFlag} 0 ${this.getCoordFromDegrees(
                degrees,
                radius,
                svgSize
            )}`
        );
        commands.push(
            `L ${this.getCoordFromDegrees(degrees, innerRadius, svgSize)}`
        );
        commands.push(
            `A ${innerRadius} ${innerRadius} 0 ${longPathFlag} 1 ${svgSize / 2 + innerRadius
            } ${svgSize / 2}`
        );
        return commands.join(' ');
    }

    getCoordFromDegrees(angle: number, radius: number, svgSize: number): string {
        const x = Math.cos((angle * Math.PI) / 180);
        const y = Math.sin((angle * Math.PI) / 180);
        const coordX = x * radius + svgSize / 2;
        const coordY = y * -radius + svgSize / 2;
        return [coordX, coordY].join(' ');
    }

    percentToDegrees(percent: number): number {
        return percent * 3.6 === 360 ? 359.99 : percent * 3.6
    }
}


export default function pieMaker(
    data: DonutSlice[],
    radius: number,
    viewBox: number,
    borderSize: number,
    clickCb: (slice: DonutSlice
    ) => void): SVGElement {
    const helper = new CalculusHelper();

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${viewBox} ${viewBox}`);

    helper.getSlicesWithCommandsAndOffsets(data, radius, viewBox, borderSize)
    .map((slice) => {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        // must or paths render out of screen
        path.style.transformOrigin = 'center';

        // set black color of thin border on left and right
        path.setAttribute('stroke', 'black');
        path.setAttribute('stroke-width', '0.1');


        path.setAttribute('fill', slice.color);
        path.setAttribute('d', slice.commands);
        path.setAttribute('transform', `rotate(${slice.offset})`);
        path.onclick = () => clickCb(slice);
        path.innerHTML = `<title style="color: red">${slice.label}</title>`;
        svg.appendChild(path);
    });

    return svg
}
