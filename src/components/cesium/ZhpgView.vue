<!--
 * @Author: 陈巧龙
 * @Date: 2023-09-04 14:47:41
 * @LastEditors: 陈巧龙
 * @LastEditTime: 2023-09-19 10:09:32
 * @FilePath: \ys.skxlsyb\src\components\cesium\ZhpgView.vue
 * @Description: 灾后评估报表结果展示
-->

<template>
    <!-- 创建灾后评估界面 -->
    <div class="zhpg-page" v-if="showZhpgPage">
        <!-- 添加关闭控件 -->
        <img style="cursor: pointer;" @click="closeZhpgPage" src="../../assets/image/marker/关闭.png" />
        <div class="zhpg">
            <el-table :key="Math.random()" :data="tableData" stripe height="100%"
                style="background:transparent;width: 100%;max-height: 100%; overflow: auto">
                <el-table-column prop="name" label="洪水淹没村庄" min-width="20%">
                </el-table-column>
                <el-table-column prop="risklevel" label="风险等级" min-width="15%">
                </el-table-column>
                <el-table-column prop="losslife" :label="label1()" min-width="25%">
                </el-table-column>
                <el-table-column prop="ecoloss" :label="label2()" min-width="18%">
                </el-table-column>
                <el-table-column prop="sco_ecology_loss" :label="label3()" min-width="25%">
                </el-table-column>
            </el-table>
        </div>
    </div>
</template>

<script>
export default {
    name: "zhpgView",
    data() {
        return {
            //初始化页面显示
            showZhpgPage: true,
            //初始化显示第一个表格的数据
            activeName: 'first',
            //校核洪水数据
            tableData: [],
        }
    },
    mounted() {
        //向表格添加数据之前先清空数据
        this.tableData = []
        //分别将数据映射到表格中
        const zhpgData = (data) => {
            return data.map(item => ({
                name: item.hsymcz,
                risklevel: item.fxdj,
                losslife: item.ymqsmss,
                ecoloss: item.jjss,
                sco_ecology_loss: item.shystss
            }));
        };
        //分别得到校核洪水和设计洪水灾后评估信息
        this.tableData = zhpgData(this.$store.state.kbData.data);

        const transformedData = this.$store.state.kbData.data.map(item => [item.hsymcz, [item.lat_x, item.long_y]]);
        
        this.$bus.$emit("mapData", transformedData);
    },

    methods: {
        //使用模糊方法查询数组的值
        queryData(data, query) {
            const filteredData = Object.keys(data).filter(key => key.includes(query));
            return filteredData.map(key => data[key]);
        },
        //关闭窗口
        closeZhpgPage() {
            this.showZhpgPage = false
            this.$bus.$emit("closePage", this.showZhpgPage);
        },
        /* 控制表头数据进行换行 */
        label1() {
            return `淹没区生命损失\n(人)`;
        },
        label2() {
            return `经济损失\n(亿元)`;
        },
        label3() {
            return `社会与生态损失\n(亿元)`;
        },
    }
}
</script>

<style lang="scss" scoped>
.zhpg-page {
    width: 30%;
    height: 35%;
    position: absolute;
    bottom: -4%;
    left: 16%;
    transform: translate(-50%, -50%);
    background: url(../../assets/image/marker/弹窗框.png);
    background-size: 100% 100%;
    color: white;
    z-index: 1;
    /* 添加 z-index 属性 */
}

.zhpg-page img {
    position: absolute;
    right: 5%;
    margin-top: 5%;
    z-index: 2;
    /* 添加较高的 z-index 值 */
}

.zhpg {
    width: 95%;
    height: 82%;
    position: absolute;
    top: 54%;
    left: 50%;
    transform: translate(-50%, -50%);
}

//修改tebs标签页字体样式
::v-deep .el-tabs__item {
    color: white;
    font-size: 13px;
}

//修改tebs标签页字体选择样式
::v-deep .el-tabs__item.is-active {
    color: #409EFF;
}

//修改tebs标签页中横线样式
::v-deep .el-tabs__nav-wrap::after {
    background-color: transparent;
}

//设置表格的表头样式
::v-deep .el-table th {
    background: rgba(7, 110, 151);
    color: white;
    font-size: 10px;
}

::v-deep .el-table th.el-table__cell>.cell {
    white-space: pre;
}

//设置表格样式
::v-deep .el-table tr {
    background: transparent;
    color: white;
}

//设置斑马表格的颜色
::v-deep .el-table--striped .el-table__body tr.el-table__row--striped td {
    background: rgba(20, 65, 84);
}

//设置表格中的间距
::v-deep .el-table .el-table__cell {
    padding: 5px;
    padding-left: 0px;
}

// 修改表格的文本对齐和内边距
::v-deep .el-table,
::v-deep th.el-table__cell>.cell {
    text-align: center;
    padding: 0;
}

//修改表格单元格文本对齐和内边距
::v-deep .el-table,
::v-deep .cell {
    text-align: center;
    padding: 0
}

//修改表格前面的元素高度，实现隐藏表格边框
::v-deep .el-table::before {
    height: 0
}

//删除行内间直线
::v-deep .el-table td,
.building-top .el-table th.is-leaf {
    border-bottom: 0;
}

//删除表头直线
::v-deep .el-table td.el-table__cell,
::v-deep .el-table th.el-table__cell.is-leaf {
    border-bottom: 0;
}

//鼠标停在处进行高亮显示
::v-deep .el-table--enable-row-hover .el-table__body tr:hover>td {
    background-color: rgba(4, 224, 232, 0.3);
}
</style>