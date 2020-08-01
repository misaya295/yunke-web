<template>
  <div class="app-container">
    <div class="filter-container">
      <!-- 输入框 -->
      <el-input
        v-model="queryParams.assetsName"
        placeholder="学校资产ID"
        class="filter-item search-item"
      ></el-input>
      <el-input
        v-model="queryParams.repairPrice"
        placeholder="维修价格"
        class="filter-item search-item"
      ></el-input>
      <el-input
        v-model="queryParams.repairProverUserInfoUuid"
        placeholder="维修证明人ID"
        class="filter-item search-item"
      ></el-input>
      <el-button @click="searchrepair" type="primary" class="filter-item" plain>搜索</el-button>
      <el-button @click="resetrepair" type="warning" class="filter-item" plain>重置</el-button>
      <!-- table内容 -->
      <el-table ref="tableref" :data="repairList" border fit style="width: 100%;">
        <el-table-column type="expand">
          <template slot-scope="props">
            <el-form label-position="left" class="table-expand">
              <el-form-item label="维修信息ID:">
                <span>{{ props.row.id }}</span>
              </el-form-item>
              <el-form-item label="发票:">
                <span>{{ props.row.repairInvoice }}</span>
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column type="selection" align="center" width="40px" />
        <el-table-column
          label="学校资产ID"
          prop="assetsName"
          :show-overflow-tooltip="true"
          align="center"
          min-width="80px"
        ></el-table-column>
        <el-table-column
          label="维修价格"
          prop="repairPrice"
          :show-overflow-tooltip="true"
          align="center"
          min-width="50px"
        ></el-table-column>
        <el-table-column
          label="维修日期"
          prop="repairDate"
          :show-overflow-tooltip="true"
          align="center"
          min-width="120px"
        ></el-table-column>
        <el-table-column
          label="维修证明人ID"
          prop="repairProverUserInfoUuid"
          :show-overflow-tooltip="true"
          align="center"
          min-width="120px"
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
              content="完成维修"
              placement="top"
              :enterable="false"
            >
              <i
                class="el-icon-check table-operation"
                style="color: #87d068;"
                @click="changeReimbursement(slope.row)"
              />
            </el-tooltip>
            <el-tooltip
              class="item"
              effect="dark"
              content="修改维修数据"
              placement="top"
              :enterable="false"
            >
              <i
                class="el-icon-setting table-operation"
                style="color: #2db7f5;"
                @click="showEditDialog(slope.row)"
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

      <!-- 修改对话框 -->
      <el-dialog
        @close="closeEditDialog"
        title="修改考证信息"
        :visible.sync="editDialogVisible"
        width="50%"
      >
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
          <el-form-item label="学校资产ID" prop="assetsName">
            <el-input v-model="editForm.assetsName" disabled></el-input>
          </el-form-item>
          <el-form-item label="维修证明人ID" prop="repairProverUserInfoUuid">
            <el-input v-model="editForm.repairProverUserInfoUuid" disabled></el-input>
          </el-form-item>
          <el-form-item label="维修价格" prop="repairPrice" type="number">
            <el-input v-model.number="editForm.repairPrice"></el-input>
          </el-form-item>
          <el-form-item label="维修日期" prop="repairDate">
            <el-date-picker
              v-model="editForm.repairDate"
              type="datetime"
              placeholder="选择日期时间"
              align="right"
              format="yyyy-MM-dd HH:mm:ss"
              value-format="yyyy-MM-dd HH:mm:ss"
              style="width: 100%"
            ></el-date-picker>
          </el-form-item>
          <el-form-item label="发票" prop="repairInvoice">
            <el-input v-model="editForm.repairInvoice"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editRepair">修 改</el-button>
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
      //输入框的值
      input: "",
      //存放查询数据
      repairList: null,
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
      drawerVisible: false,
      addDialogVisible: false,
      userInfo: {},
      //修改对话框的显示与隐藏
      editDialogVisible: false,
      //绑定修改对话框中的表单数据
      editForm: {
        assetsName: "",
        repairPrice: "",
        repairDate: "",
        repairInvoice: "",
        repairProverUserInfoUuid: "",
        id: 0,
      },
      //修改对话框的验证规则
      editFormRules: {
        repairPrice: [
          {
            validator(rule, value, callback) {
              if (value == "") {
                callback();
              }
              if (Number.isInteger(Number(value)) && Number(value) > 0) {
                callback();
              } else {
                callback(new Error("请输入有效数字"));
              }
            },
            trigger: "blur",
          },
        ],
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
      this.$get("studio/school/assets/repair", {
        ...params,
      }).then((r) => {
        const data = r.data.data;
        this.total = data.total;
        this.repairList = data.rows;
        console.log(data);
        this.loading = false;
      });
    },
    search() {
      this.fetch({
        ...this.queryParams,
        ...this.sort,
      });
    },

    //监听关闭对话框事件
    closeAddDialog() {
      this.$refs.addFormRef.resetFields();
    },
    // 搜索证书
    searchrepair() {
      console.log(this.queryParams);
      this.$get(`studio/school/assets/repair`, { ...this.queryParams }).then(
        (r) => {
          const data = r.data.data;
          this.repairList = data.rows;
          this.total = data.total;
          console.log(r);
        }
      );
    },
    //重置搜索框数据
    resetrepair() {
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
    //弹出完成维修对话框
    async changeReimbursement(row) {
      console.log(row);
      //检查维修日期，价格是否填写
      if (row.repairDate == "" || row.repairDate == null) {
        return this.$message.info("请填写维修日期后再点击该按钮！");
      }
      if (row.repairPrice == "" || row.repairPrice == null) {
        return this.$message.info("请填写维修价格后再点击该按钮！");
      }

      //符合条件，弹出完成维修对话框
      // this.reimbursementDialogVisible = true
      const confirmResult = await this.$confirm(
        "是否确认完成维修?该维修信息将被删除",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);

      if (confirmResult !== "confirm") {
        return this.$message.info("取消了该操作");
      }

      this.$delete(`studio/school/assets/repair/${row.id}`, {
        ...this.Funding,
      }).then((r) => {
        console.log(r);
        if (r.status == 200) {
          this.$message.success("完成维修!");
        } else {
          this.$message.error("提交失败！");
        }
        this.fetch();
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
    editRepair() {
      this.$refs.editFormRef.validate((valid) => {
        if (!valid) return;
        this.$put("studio/school/assets/repair", { ...this.editForm }).then(
          (r) => {
            if (r.status === 200) {
              this.$message.success("修改证书成功！");
              this.editDialogVisible = false;
            } else {
              this.$message.error("修改证书失败！");
            }
            this.fetch();
          }
        );
      });
    },
    //监听关闭对话框事件
    closeEditDialog() {
      this.$refs.editFormRef.resetFields();
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
