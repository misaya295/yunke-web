<template>
  <div class="app-container">
    <div class="filter-container">
      <!-- 输入框 -->
      <el-input v-model="queryParams.assetsName" placeholder="资产名称" class="filter-item search-item"></el-input>
      <el-input v-model="queryParams.assetsNum" placeholder="资产编号" class="filter-item search-item"></el-input>
      <el-input v-model="queryParams.price" placeholder="资产价格" class="filter-item search-item"></el-input>
      <el-input
        v-model="queryParams.scrapDetail"
        placeholder="报废信息"
        class="filter-item search-item"
      ></el-input>
      <el-button @click="searchAssets" type="primary" class="filter-item" plain>搜索</el-button>
      <el-button @click="resetAssets" type="warning" class="filter-item" plain>重置</el-button>
      <el-button type="success" class="filter-item" @click="showAddDialog" plain>添加</el-button>
      <!-- table内容 -->
      <el-table ref="tableref" :data="assetsList" border fit style="width: 100%;">
        <el-table-column type="selection" align="center" width="40px" />
        <el-table-column
          label="资产名称"
          prop="assetsName"
          :show-overflow-tooltip="true"
          align="center"
          min-width="80px"
        ></el-table-column>
        <el-table-column
          label="资产编号"
          prop="assetsNum"
          :show-overflow-tooltip="true"
          align="center"
          min-width="90px"
        ></el-table-column>
        <el-table-column
          label="资产价格"
          prop="price"
          :show-overflow-tooltip="true"
          align="center"
          min-width="80px"
        ></el-table-column>
        <el-table-column
          label="收录日期"
          prop="inclusionDate"
          :show-overflow-tooltip="true"
          align="center"
          min-width="100px"
        ></el-table-column>
        <el-table-column
          label="报废日期"
          prop="scrapDate"
          :show-overflow-tooltip="true"
          align="center"
          min-width="100px"
        ></el-table-column>
        <el-table-column
          label="报废信息"
          prop="scrapDetail"
          :show-overflow-tooltip="true"
          align="center"
          min-width="150px"
        ></el-table-column>
        <el-table-column
          label="操作"
          align="center"
          min-width="80px"
          class-name="small-padding fixed-width"
        >
          <template slot-scope="slope">
            <el-tooltip
              class="item"
              effect="dark"
              content="申请维修"
              placement="top"
              :enterable="false"
            >
              <i
                class="el-icon-coin table-operation"
                style="color: #87d068;"
                @click="fixAssets(slope.row)"
              />
            </el-tooltip>
            <el-tooltip
              class="item"
              effect="dark"
              content="修改资产"
              placement="top"
              :enterable="false"
            >
              <i
                class="el-icon-setting table-operation"
                style="color: #2db7f5;"
                @click="showEditDialog(slope.row)"
              />
            </el-tooltip>
            <el-tooltip
              class="item"
              effect="dark"
              content="删除资产"
              placement="top"
              :enterable="false"
            >
              <i
                class="el-icon-delete table-operation"
                style="color: #F56C6C;"
                @click="deleteAssets(slope.row)"
              />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="pagination.num"
        :limit.sync="pagination.size"
        @pagination="search"
      />

      <!-- 添加对话框 -->
      <el-dialog @close="closeAddDialog" title="添加资产" :visible.sync="addDialogVisible" width="50%">
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
          <el-form-item label="资产名称" prop="assetsName">
            <el-input v-model="addForm.assetsName"></el-input>
          </el-form-item>
          <el-form-item label="资产编号" prop="assetsNum">
            <el-input v-model="addForm.assetsNum"></el-input>
          </el-form-item>
          <el-form-item label="资产价格" prop="price" type="number">
            <el-input v-model="addForm.price"></el-input>
          </el-form-item>
          <el-form-item label="报废日期" prop="scrapDate">
            <el-date-picker
              v-model="addForm.scrapDate"
              type="datetime"
              placeholder="选择日期时间"
              align="right"
              format="yyyy-MM-dd HH:mm:ss"
              value-format="yyyy-MM-dd HH:mm:ss"
              style="width: 100%"
            ></el-date-picker>
          </el-form-item>
          <el-form-item label="报废信息" prop="scrapDetail">
            <el-input v-model="addForm.scrapDetail"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addAssets">添 加</el-button>
        </span>
      </el-dialog>

      <!-- 修改对话框 -->
      <el-dialog
        @close="closeEditDialog"
        title="修改资产信息"
        :visible.sync="editDialogVisible"
        width="50%"
      >
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
          <el-form-item label="资产名称" prop="assetsName">
            <el-input v-model="editForm.assetsName"></el-input>
          </el-form-item>
          <el-form-item label="资产编号" prop="assetsNum">
            <el-input v-model="editForm.assetsNum"></el-input>
          </el-form-item>
          <el-form-item label="资产价格" prop="price" type="number">
            <el-input v-model="editForm.price"></el-input>
          </el-form-item>
          <el-form-item label="报废日期" prop="scrapDate">
            <el-date-picker
              v-model="editForm.scrapDate"
              type="datetime"
              placeholder="选择日期时间"
              align="right"
              format="yyyy-MM-dd HH:mm:ss"
              value-format="yyyy-MM-dd HH:mm:ss"
              style="width: 100%"
            ></el-date-picker>
          </el-form-item>
          <el-form-item label="报废信息" prop="scrapDetail">
            <el-input v-model="editForm.scrapDetail"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editAssets">修 改</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import Pagination from "@/components/Pagination";
export default {
  name: "Index",
  components: { Pagination },
  data() {
    return {
      //存放查询数据
      assetsList: null,
      //存放查询数目
      total: 0,
      list: null,
      queryParams: {},
      sort: {},
      selection: [],
      pagination: {
        size: 10,
        num: 1,
      },
      //添加对话框的显示与隐藏
      addDialogVisible: false,
      //存放用户信息
      userInfo: {},
      //绑定添加对话框中的表单数据
      addForm: {
        id: 0,
        assetsName: "",
        assetsNum: "",
        price: 0,
        inclusionDate: "",
        scrapDate: "",
        scrapDetail: "",
      },
      //添加对话框的验证规则
      addFormRules: {
        assetsName: [
          { required: true, message: "请填写资产名称！", trigger: "blur" },
        ],
        assetsNum: [
          { required: true, message: "请填写资产编号！", trigger: "blur" },
        ],
        price: [
          {
            validator(rule, value, callback) {
              if (value == "") {
                callback();
              }
              if (Number(value) >= 0) {
                callback();
              } else {
                callback(new Error("请输入有效数字"));
              }
            },
            trigger: "blur",
          },
        ],
      },
      //修改对话框的显示与隐藏
      editDialogVisible: false,
      //绑定修改对话框中的表单数据
      editForm: {
        // id: 0,
        // assetsName: "",
        // assetsNum: "",
        // price: "",
        // inclusionDate: "",
        // scrapDate: "",
        // scrapDetail: "",
      },
      //修改对话框的验证规则
      editFormRules: {
        assetsName: [
          { required: true, message: "请填写资产名称！", trigger: "blur" },
        ],
        assetsNum: [
          { required: true, message: "请填写资产编号！", trigger: "blur" },
        ],
        price: [
          {
            validator(rule, value, callback) {
              if (value == "") {
                callback();
              }
              if (Number(value) >= 0) {
                callback();
              } else {
                callback(new Error("请输入有效数字"));
              }
            },
            trigger: "blur",
          },
        ],
      },
      //报修所需的对象
      schoolAssetsRepair: {
        assetsName: "",
        repairProverUserInfoUuid: 0,
      },
    };
  },
  created() {
    //获取用户信息
    this.userInfo = this.currentUser;
  },
  mounted() {
    this.fetch();
  },
  computed: {
    currentUser() {
      const user = this.$store.state.account.user;
      this.userInfo = user;
      return user;
    },
  },
  methods: {
    //根据条件获取所有考证信息
    fetch(params = {}) {
      params.pageSize = this.pagination.size;
      params.pageNum = this.pagination.num;
      if (this.queryParams.timeRange) {
        params.createTimeFrom = this.queryParams.timeRange[0];
        params.createTimeTo = this.queryParams.timeRange[1];
      }
      this.loading = true;
      this.$get("studio/school/assets", {
        ...params,
      }).then((r) => {
        const d = r.data.data;
        this.total = d.total;
        this.assetsList = d.rows;
        console.log(r);
        this.loading = false;
      });
    },
    search() {
      this.fetch({
        ...this.queryParams,
        ...this.sort,
      });
    },

    //展示对话框
    showAddDialog() {
      this.addDialogVisible = true;
    },
    //提交添加资产表单
    addAssets() {
      this.$refs.addFormRef.validate((valid) => {
        if (!valid) return;
        //如果费用为空，则把它转为数字类型
        if (this.addForm.price == "") {
          this.addForm.price = "" - 0;
        }
        //将当前时间作为收录日期
        this.addForm.inclusionDate = this.getTime();
        this.$post("studio/school/assets", {
          ...this.addForm,
        }).then((r) => {
          if (r.status == 200) {
            this.$message.success("添加资产成功!");
          } else {
            this.$message.error("添加资产失败！");
          }
          this.fetch();
        });
        this.addDialogVisible = false;
      });
    },
    //监听关闭对话框事件
    closeAddDialog() {
      this.$refs.addFormRef.resetFields();
    },
    // 搜索资产
    searchAssets() {
      console.log(this.queryParams);
      this.$get(`studio/school/assets`, { ...this.queryParams }).then((r) => {
        const data = r.data.data;
        this.assetsList = data.rows;
        this.total = data.total;
        console.log(r);
      });
    },
    //重置搜索框数据
    resetAssets() {
      this.queryParams = {};
      this.fetch();
    },
    //获取时间
    getTime: function () {
      var _this = this;
      let yy = new Date().getFullYear();
      let mm =
        new Date().getMonth() + 1 < 10
          ? "0" + (new Date().getMonth() + 1)
          : new Date().getMonth() + 1;
      let dd =
        new Date().getDate() < 10
          ? "0" + new Date().getDate()
          : new Date().getDate();
      let HH =
        new Date().getHours() < 10
          ? "0" + new Date().getHours()
          : new Date().getHours();
      let MM =
        new Date().getMinutes() < 10
          ? "0" + new Date().getMinutes()
          : new Date().getMinutes();
      let SS =
        new Date().getSeconds() < 10
          ? "0" + new Date().getSeconds()
          : new Date().getSeconds();
      _this.nowTime = HH + ":" + MM + ":" + SS;
      _this.nowDate = yy + "-" + mm + "-" + dd;
      return _this.nowDate + " " + _this.nowTime;
    },
    //弹出申请维修确认框
    //检查报修报500
    async fixAssets(row) {
      console.log(row);
      //检查资产是否填写了报废日期和信息
      if (row.scrapDate == "" || row.scrapDate == null) {
        return this.$message.info("请填写报废日期后再报修！");
      }
      if (row.scrapDetail == "" || row.scrapDetail == null) {
        return this.$message.info("请填写报废信息后再报修！");
      }
      //检查是否已经报修
      const searchByAssetsName = {};
      searchByAssetsName.assetsName = row.id;
      this.$get("studio/school/assets/repair", { ...searchByAssetsName }).then((r) => {
        console.log("r:" + r)
      });

      //符合条件，弹出报修对话框
      const confirmResult = await this.$confirm("是否确认报修?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).catch((err) => err);

      if (confirmResult !== "confirm") {
        return this.$message.info("取消了报修");
      }

      this.schoolAssetsRepair.assetsName = row.id;
      this.schoolAssetsRepair.repairProverUserInfoUuid = this.userInfo.userId;
      console.log(this.schoolAssetsRepair);
      this.$post("studio/school/assets/repair", {
        ...this.schoolAssetsRepair,
      }).then((r) => {
        if (r.status == 200) {
          this.$message.success("报修成功!");
        } else {
          this.$message.error("报修失败！");
        }
      });
    },
    //修改证书对话框
    showEditDialog(row) {
      //获得数据
      //浅克隆，同一源里的数值也会改变
      // this.editForm = row;
      this.editForm = Object.assign({}, row);
      this.editDialogVisible = true;
    },
    //提交修改对话框
    editAssets() {
      this.$refs.editFormRef.validate((valid) => {
        if (!valid) return;
        this.$put("studio/school/assets", { ...this.editForm }).then((r) => {
          console.log(r);
          if (r.status === 200) {
            this.$message.success("修改资产成功！");
            this.editDialogVisible = false;
            this.fetch();
          } else {
            this.$message.error("修改资产失败！");
          }
        });
      });
    },
    //监听关闭对话框事件
    closeEditDialog() {
      this.$refs.editFormRef.resetFields();
    },
    //删除资产
    async deleteAssets(row) {
      //符合条件，弹出确认对话框
      const confirmResult = await this.$confirm(
        "被删除的数据将无法恢复，是否确认删除?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);

      if (confirmResult !== "confirm") {
        return this.$message.info("取消了删除");
      }

      this.$delete(`studio/school/assets/${row.id}`).then((r) => {
        console.log(r);
        if (r.status == 200) {
          this.$message.success("该资产已成功删除！");
        } else {
          this.$message.error("删除失败！");
        }
        this.fetch();
      });
    },
  },
};
</script>

<style scoped>
.table-expand {
  font-size: 0;
}
.table-expand label {
  width: 90px;
  color: #99a9bf;
}
.table-expand .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 50%;
}
</style>
