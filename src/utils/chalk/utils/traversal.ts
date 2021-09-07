function defaultSkip(): boolean {
    return false;
}

function defaultBreak(): boolean {
    return false;
}

function defaultSkipChildrenFn(): boolean {
    return false;
}

function defaultChildren(node: Node): any {
    return node.childNodes;
}

export default function () {
    let childrenFn: Function = defaultChildren;
    let skipFn: Function = defaultSkip;
    let breakFn: Function = defaultBreak;
    let skipChildrenFn: Function = defaultSkipChildrenFn;

    function eachBefore<T>(rootNode: T, callback: (node: T) => void) {
        let node: T | undefined = rootNode;
        const nodes = [node];
        let children;
        let i;

        while ((node = nodes.pop())) {
            if (skipFn(node)) continue;
            if (breakFn(node)) break;

            callback(node);

            if (skipChildrenFn(node)) continue;
            children = childrenFn(node);

            if (children) {
                for (i = children.length - 1; i >= 0; --i) {
                    nodes.push(children[i]);
                }
            }
        }

        return rootNode;
    }

    eachBefore.skip = function <T>(x: (node: T) => any): typeof eachBefore {
        arguments.length && (skipFn = required(x));
        return eachBefore;
    };

    eachBefore.skipChildren = function <T>(x: (node: T) => any): typeof eachBefore {
        arguments.length && (skipChildrenFn = required(x));
        return eachBefore;
    };

    eachBefore.break = function <T>(x: (node: T) => any): typeof eachBefore {
        arguments.length && (breakFn = required(x));
        return eachBefore;
    };

    eachBefore.children = function <T>(x: (node: T) => any): typeof eachBefore {
        arguments.length && (childrenFn = required(x));
        return eachBefore;
    };

    return eachBefore;
}

function required(f: Function) {
    if (typeof f !== 'function') throw new Error();
    return f;
}
