const k_op = {
    // calculator ==> value
    add: (m1, m2) => m1 + m2,
    sub: (m1, m2) => m1 - m2,
    mul: (m, k) => m * k,
    mod: (m, k) => m % k,
    div: (m, k) => m / k,

    // cmp ==> bool
    ne: (m1, m2) => m1 !== m2,
    eq: (m1, m2) => m1 === m2,
    gt: (m1, m2) => m1 > m2,
    ge: (m1, m2) => m1 >= m2,
    lt: (m1, m2) => m1 < m2,
    le: (m1, m2) => m1 <= m2,
    isSibling: (m1, m2) => m1.constructor.name === m2.constructor.name,
};

const opFmt = (d1, d2, op_func, fmt_func) => {
    // @op_func : Function : op_func(a, b)
    // @fmt_func: Function : fmt_func(data) => {Object}, default is fmt_func();
    const result = fmt_func();
    if (op_func instanceof Function && fmt_func instanceof Function) {
        const m1 = fmt_func(d1);
        const m2 = fmt_func(d2);
        for (let key in result) {
            let v1 = m1[key];
            let v2 = m2[key];
            let v = op_func(v1, v2);
            result[key] = v;
        }
    }
    return result;
};

const opObj = (data, k, op_func) => {
    // @data：Object
    // @k   : number
    // @op_func : Function : op_func(m, k)
    if (data instanceof Object && op_func instanceof Function) {
        const result = {};
        for (let key in data) {
            result[key] = op_func(data[key], k)
        }
        return result;
    }
};


const eqObj = (d1, d2, soft = true) => {
    // return Boolean
    const iseq = (v1, v2) => {
        if (soft) {
            return v1 == v2
        } else {
            return v1 === v2;
        }
    };

    if (d1 && d2 && d1 instanceof Object && d2 instanceof Object) {
        const m = Object.assign({}, d1, d2);
        for (let key in m) {
            let v1 = d1[key];
            let v2 = d2[key];
            if (!iseq(v1, v2)) {
                return false
            }
        }
        return true;
    } else {
        return iseq(d1, d2)
    }
};


class OPModel {
    constructor(refer_obj) {
        this.refer_obj = refer_obj;
    }

    fmt(data, strict = false) {
        const refer = this.refer_obj;
        if (data && strict) {
            const result = {};
            for (let key in refer) {
                let value = data[key];
                if (value === undefined) {
                    value = refer[key]
                }
                result[key] = value;
            }
            return result;
        } else {
            return Object.assign({}, refer, data);
        }
    }

    add(m1, m2) {
        return opFmt(m1, m2, k_op.add, this.fmt.bind(this));
    }

    sub(m1, m2) {
        return opFmt(m1, m2, k_op.sub, this.fmt.bind(this));
    }

    mul(m, k) {
        return opObj(this.fmt.bind(this)(m), k, k_op.mul);
    }

    mod(m, k) {
        return opObj(this.fmt.bind(this)(m), k, k_op.mod);
    }

    div(m, k) {
        return opObj(this.fmt.bind(this)(m), k, k_op.div);
    }

    eq(m1, m2) {
        return eqObj(m1, m2, k_op.eq, this.fmt.bind(this));
    }

    // 向量积，通常 m1 为各项原始数据， m2 为各项权重
    crossMul(m1, m2) {
        return opFmt(m1, m2, k_op.mul, this.fmt.bind(this));
    }

    crossDiv(m1, m2) {
        return opFmt(m1, m2, k_op.div, this.fmt.bind(this));
    }

    sum(ms) {
        const self = this;
        if (ms instanceof Array && ms.length > 0) {
            if (ms.length === 1) {
                return this.fmt.bind(this)(ms[0]);
            } else {
                return ms.reduce(self.add.bind(self));
            }
        }
        return self.refer_obj;
    }

}


module.exports = {
    k_op: k_op,
    opFmt: opFmt,
    opObj: opObj,
    eqObj: eqObj,
    OPModel: OPModel,
};