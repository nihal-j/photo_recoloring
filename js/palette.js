/**
 * @author Zhou Bowei
 */

var Palette = {};

Palette.init = function(img) {
    this.bins = {};
    this.bin_range = 16;
    this.bin_size = 256 / this.bin_range;
    this.channels = 4;
    this.dataArray = img.data;
    this.kmeans_iteration = 15;
    this.K = 5;
    this.kmeans_centers = [];

    for (var i = 0; i < this.K + 1; i++) {
        this.kmeans_centers.push({
            color: null,
            weight: 0,
            acc: [0, 0, 0]
        });
    }

    for (var i = 0; i < this.bin_range; i++) {
        for (var j = 0; j < this.bin_range; j++) {
            for (var k = 0; k < this.bin_range; k++) {
                var tmp = {
                    color: [(i + 0.5) * this.bin_size, (j + 0.5) * this.bin_size, (k + 0.5) * this.bin_size],
                    count: 0,
                    idx: -1
                };
                tmp.Lab = Color.rgb2lab(tmp.color);
                this.bins['r' + i + 'g' + j + 'b' + k] = tmp;
            }
        }
    }
}

Palette.palette = function() {
    var l = this.dataArray.length;
    for (var i = 0; i < l; i += this.channels) {
        var R = this.dataArray[i];
        var G = this.dataArray[i + 1];
        var B = this.dataArray[i + 2];
        var ri = Math.floor(R / this.bin_size);
        var gi = Math.floor(G / this.bin_size);
        var bi = Math.floor(B / this.bin_size);
        this.bins['r' + ri + 'g' + gi + 'b' + bi].count++;
        // if (this.bins['r' + ri + 'g' + gi + 'b' + bi].count == 10000) {
        //     console.log(this.bins['r' + ri + 'g' + gi + 'b' + bi].color);
        // }
        // var Lab = Color.rgb2lab([R, G, B]);
    }
}

Palette.distance2 = function(c1, c2) {
    var res = 0;
    for (var i = 0; i < c1.length; i++) {
        res += (c1[i] - c2[i]) * (c1[i] - c2[i]);
    }
    return res;
}

Palette.kmeansFirst = function() {
    var centers = []; //rgb format
    var centers_lab=[];
    centers.push([this.bin_size / 2, this.bin_size / 2, this.bin_size / 2]); // black
    centers_lab.push(Color.rgb2lab(centers[0]));
    var bins_copy = {};
    for (var i in this.bins) {
        bins_copy[i] = this.bins[i].count;
    }
    console.log(bins_copy);

    for (var p = 0; p < this.K; p++) {
        var tmp;
        var maxc = -1;
        for (var i in bins_copy) {
        //    if (p > 0) {
                var d2 = this.distance2(this.bins[i].Lab, centers_lab[p]);
                var factor = 1 - Math.exp(-d2 / 6400); // sigma_a:80
                bins_copy[i] *= factor;
        //    }
            if (bins_copy[i] > maxc) {
                maxc = bins_copy[i];
                tmp = [];
                for (var j = 0; j < 3; j++) {
                    tmp.push(this.bins[i].color[j]);
                }
            }
        }
        centers.push(tmp);
        centers_lab.push(Color.rgb2lab(tmp));
    }
    return centers;
}

Palette.kmeans = function() {
    var no_change = false;
    for (var it = 0; it < this.kmeans_iteration; it++) {
        no_change = true;
        for (var i = 0; i < this.bin_range; i++) {
            for (var j = 0; j < this.bin_range; j++) {
                for (var k = 0; k < this.bin_range; k++) {
                    var tmp = this.bins['r' + i + 'g' + j + 'b' + k];
                    if (tmp.count == 0) {
                        continue;
                    }

                    var lab = tmp.Lab;
                    var mind = Infinity;
                    var mini = -1;
                    for (var p = 0; p < this.kmeans_centers.length; i++) {
                        var d = this.distance2(this.kmeans_centers[p], lab);
                        if (mind > d) {
                            mind = d;
                            mini = p;
                        }
                    }
                    if (mini != tmp.idx) {
                        tmp.idx = mini;
                        no_change = false;
                    }
                }
            }
        }

        if (no_change) {
            break;
        }
        console.log(it);
    }
}
