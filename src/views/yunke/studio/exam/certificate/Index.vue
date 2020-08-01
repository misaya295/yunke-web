<template>
  <div class="app-container">
    <div class="filter-container">
      <!-- 输入框 -->
      <el-input v-model="queryParams.fullName" placeholder="姓名" class="filter-item search-item"></el-input>
      <el-select v-model="queryParams.state" placeholder="请选择考试状态">
        <el-option
          v-for="(item,i) in stateOptions"
          :key="i"
          :label="item.label"
          :value="item.value"
        ></el-option>
      </el-select>
      <el-button @click="searchCertificate" type="primary" class="filter-item" plain>搜索</el-button>
      <el-button @click="resetCertificate" type="warning" class="filter-item" plain>重置</el-button>
      <el-button
        type="success"
        class="filter-item table-operation"
        @click="showAddDialog"
        plain
        v-hasPermission="['certificate:add']"
      >添加</el-button>
      <!-- table内容 -->
      <el-table ref="tableref" :data="certificateList" border fit style="width: 100%;">
        <el-table-column type="expand">
          <template slot-scope="props">
            <el-form label-position="left" class="table-expand">
              <el-form-item label="考证ID:">
                <span>{{ props.row.id }}</span>
              </el-form-item>
              <el-form-item label="发票:">
                <span>{{ props.row.invoice }}</span>
              </el-form-item>
              <el-form-item label="证书:">
                <span>{{ props.row.certificate }}</span>
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column type="selection" align="center" width="40px" />
        <el-table-column
          label="姓名"
          prop="fullName"
          :show-overflow-tooltip="true"
          align="center"
          min-width="80px"
        ></el-table-column>
        <el-table-column
          label="类型"
          prop="type"
          :show-overflow-tooltip="true"
          align="center"
          min-width="90px"
        ></el-table-column>
        <el-table-column
          label="证书名称"
          prop="title"
          :show-overflow-tooltip="true"
          align="center"
          min-width="150px"
        ></el-table-column>
        <el-table-column
          label="费用"
          prop="cost"
          :show-overflow-tooltip="true"
          align="center"
          min-width="50px"
        ></el-table-column>
        <el-table-column
          label="考证时间"
          prop="time"
          :show-overflow-tooltip="true"
          align="center"
          min-width="120px"
        ></el-table-column>
        <el-table-column
          label="通过状态"
          prop="success"
          :show-overflow-tooltip="true"
          align="center"
          min-width="70px"
        >
          <template slot-scope="scope">
            <i class="el-icon-success" style="color: lightgreen" v-if="scope.row.success === 1"></i>
            <i class="el-icon-error" style="color: red" v-else></i>
          </template>
        </el-table-column>
        <el-table-column
          label="是否已报销"
          prop="reimbursement"
          :show-overflow-tooltip="true"
          align="center"
          min-width="80px"
        >
          <template slot-scope="scope">
            <i
              class="el-icon-success"
              style="color: lightgreen"
              v-if="scope.row.reimbursement === 1"
            ></i>
            <i class="el-icon-error" style="color: red" v-else></i>
          </template>
        </el-table-column>
        <el-table-column
          label="考试状态"
          prop="state"
          :show-overflow-tooltip="true"
          align="center"
          min-width="80px"
        >
          <template slot-scope="scope">
            <el-tag type="warning" v-if="scope.row.state === 0">正在考取</el-tag>
            <el-tag type="success" v-else>已完成</el-tag>
          </template>
        </el-table-column>
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
              content="申请报销"
              placement="top"
              :enterable="false"
            >
              <i
                class="el-icon-coin table-operation"
                style="color: #87d068;"
                @click="changeReimbursement(slope.row)"
              />
            </el-tooltip>
            <el-tooltip
              class="item"
              effect="dark"
              content="修改证书"
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

      <!-- 添加考证抽屉 -->
      <el-drawer title="添加考证" :visible.sync="drawerVisible" @close="closeAddDialog" size="50%">
        <!-- 步骤条区域 -->
        <el-steps
          :space="200"
          :active="activeIndex - 0"
          finish-status="success"
          align-center
          class="addFormSteps"
        >
          <el-step title="基本信息"></el-step>
          <el-step title="发票上传"></el-step>
        </el-steps>
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
          <el-tabs v-model="activeIndex" tab-position="left" :before-leave="beforeTabLeave">
            <el-tab-pane label="基本信息" name="0">
              <el-form-item label="姓名" prop="fullName">
                <el-input v-model="addForm.fullName" disabled></el-input>
              </el-form-item>
              <el-form-item label="类型" prop="type">
                <el-input v-model="addForm.type"></el-input>
              </el-form-item>
              <el-form-item label="证书名称" prop="title">
                <el-input v-model="addForm.title"></el-input>
              </el-form-item>
              <el-form-item label="费用" prop="cost" type="number">
                <el-input v-model.number="addForm.cost"></el-input>
              </el-form-item>
              <el-form-item label="考证时间" prop="time">
                <el-date-picker
                  v-model="addForm.time"
                  type="datetime"
                  placeholder="选择日期时间"
                  align="right"
                  format="yyyy-MM-dd HH:mm:ss"
                  value-format="yyyy-MM-dd HH:mm:ss"
                  style="width: 100%"
                ></el-date-picker>
              </el-form-item>
              <el-form-item label="证书" prop="certificate">
                <el-input v-model="addForm.certificate"></el-input>
              </el-form-item>
              <el-form-item label="通过状态" prop="success">
                <el-radio-group v-model="addForm.success">
                  <el-radio :label="0">失败</el-radio>
                  <el-radio :label="1">成功</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="是否已报销" prop="reimbursement">
                <el-radio-group v-model="addForm.reimbursement">
                  <el-radio :label="0">否</el-radio>
                  <el-radio :label="1">是</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="考试状态" prop="state">
                <el-select v-model="addForm.state" placeholder="请选择状态" style="width:100%">
                  <el-option label="正在考取" :value="0"></el-option>
                  <el-option label="已完成" :value="1"></el-option>
                </el-select>
              </el-form-item>
            </el-tab-pane>
            <el-tab-pane label="发票上传" name="1">
              <el-upload
                :action="uploadURL"
                :on-preview="handlePreview"
                :headers="headerObj"
                :on-success="handleSuccess"
                list-type="picture"
              >
                <el-button size="small" type="primary">点击上传</el-button>
                <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
              </el-upload>
              <el-form-item class="formbutton">
                <el-button @click="addDialogVisible = false" class="addFormButton">取 消</el-button>
                <el-button type="primary" @click="addCertificate" class="addFormButton">添 加</el-button>
              </el-form-item>
            </el-tab-pane>
          </el-tabs>
        </el-form>
      </el-drawer>

      <!-- 添加对话框 -->

      <!-- 修改对话框 -->
      <el-dialog
        @close="closeEditDialog"
        title="修改考证信息"
        :visible.sync="editDialogVisible"
        width="50%"
      >
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
          <el-form-item label="姓名" prop="fullName">
            <el-input v-model="editForm.fullName" disabled></el-input>
          </el-form-item>
          <el-form-item label="类型" prop="type">
            <el-input v-model="editForm.type"></el-input>
          </el-form-item>
          <el-form-item label="证书名称" prop="title">
            <el-input v-model="editForm.title"></el-input>
          </el-form-item>
          <el-form-item label="费用" prop="cost" type="number">
            <el-input v-model.number="editForm.cost"></el-input>
          </el-form-item>
          <el-form-item label="考证时间" prop="time">
            <el-date-picker
              v-model="editForm.time"
              type="datetime"
              placeholder="选择日期时间"
              align="right"
              format="yyyy-MM-dd HH:mm:ss"
              value-format="yyyy-MM-dd HH:mm:ss"
              style="width: 100%"
            ></el-date-picker>
          </el-form-item>
          <el-form-item label="发票" prop="invoice">
            <el-input v-model="editForm.invoice"></el-input>
          </el-form-item>
          <el-form-item label="证书" prop="certificate">
            <el-input v-model="editForm.certificate"></el-input>
          </el-form-item>
          <el-form-item label="通过状态" prop="success">
            <el-radio-group v-model="editForm.success">
              <el-radio :label="0">失败</el-radio>
              <el-radio :label="1">成功</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="状态" prop="state">
            <el-select v-model="editForm.state" placeholder="请选择状态" style="width:100%">
              <el-option label="正在考取" :value="0"></el-option>
              <el-option label="已完成" :value="1"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editCertificate">修 改</el-button>
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
      certificateList: null,
      //存放查询数目
      total: 0,
      list: null,
      queryParams: {},
      stateOptions: [
        {
          value: "0",
          label: "正在考取",
        },
        {
          value: "1",
          label: "已完成",
        },
      ],
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
      //绑定添加对话框中的表单数据
      addForm: {
        fullName: "",
        type: "",
        title: "",
        cost: "",
        time: "",
        invoice: "",
        certificate: "",
        success: 0,
        reimbursement: 0,
        state: undefined,
        userId: 0,
      },
      //添加对话框的验证规则
      addFormRules: {
        type: [{ required: true, message: "请填写类型！", trigger: "blur" }],
        title: [
          { required: true, message: "请填写证书名称！", trigger: "blur" },
        ],
        cost: [
          {
            validator(rule, value, callback) {
              if (value == "") {
                callback();
              }
              if (Number.isInteger(Number(value)) && Number(value) >= 0) {
                callback();
              } else {
                callback(new Error("请输入有效数字"));
              }
            },
            trigger: "blur",
          },
        ],
        time: [
          { required: true, message: "请填写考证时间！", trigger: "blur" },
        ],
        success: [
          { required: true, message: "请填写通过状态！", trigger: "blur" },
        ],
        reimbursement: [
          { required: true, message: "请填写是否已报销！", trigger: "blur" },
        ],
        state: [{ required: true, message: "请填写状态！", trigger: "blur" }],
      },
      //修改对话框的显示与隐藏
      editDialogVisible: false,
      //绑定修改对话框中的表单数据
      editForm: {
        fullName: "",
        type: "",
        title: "",
        cost: "",
        time: "",
        invoice: "",
        certificate: "",
        success: 0,
        reimbursement: 0,
        state: undefined,
        userId: 0,
      },
      //修改对话框的验证规则
      editFormRules: {
        type: [{ required: true, message: "请填写类型！", trigger: "blur" }],
        title: [
          { required: true, message: "请填写证书名称！", trigger: "blur" },
        ],
        cost: [
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
        time: [
          { required: true, message: "请填写考证时间！", trigger: "blur" },
        ],
        success: [
          { required: true, message: "请填写通过状态！", trigger: "blur" },
        ],
        reimbursement: [
          { required: true, message: "请填写是否已报销！", trigger: "blur" },
        ],
        state: [{ required: true, message: "请填写状态！", trigger: "blur" }],
      },
      //申请报销所需的资金对象
      Funding: {
        name: "",
        applyTime: "",
        proposerId: 0,
      },
      activeIndex: 0,
      //上传图片的URL地址
      uploadURL: "http://120.78.0.140:8300/",
      //图片上传组件的headers请求头对象
      headerObj: {
        Authorization: window.sessionStorage.getItem("token"),
      },
      //保存图片路径
      previewPath: "",
      //图片预览窗口的显示与隐藏
      previewVisible: false,
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
      this.$get("studio/certificate", {
        ...params,
      }).then((r) => {
        const data = r.data.data;
        this.total = data.total;
        this.certificateList = data.rows;
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

    //展示对话框
    //完成时记得打开检查id的判断
    showAddDialog() {
      //判断是否为学生
      // if (this.userInfo.roleId !== 7) {
      //   return this.$message.info("您不是学生，无法添加证书！");
      // }
      //获得id
      this.addForm.fullName = this.userInfo.fullName;
      this.addForm.userId = this.userInfo.userId;
      this.drawerVisible = true;
      this.addDialogVisible = true;
    },
    //提交添加证书表单
    addCertificate() {
      this.$refs.addFormRef.validate((valid) => {
        if (!valid) return;
        //判断通过状态和考试状态是否冲突
        if (this.addForm.state == 0 && this.addForm.success == 1) {
          return this.$message.error("考试还未结束，无法将通过状态设置为成功!");
        }
        //如果费用为空，则把它转为数字类型
        if (this.addForm.cost == "") {
          this.addForm.cost = "" - 0;
        }
        //把考证ID转为数字
        this.addForm.id = this.addForm.id - 0;
        this.$post("studio/certificate", {
          ...this.addForm,
        }).then((r) => {
          if (r.status == 200) {
            this.$message.success("添加证书成功!");
          } else {
            this.$message.error("添加证书失败！");
          }
          this.fetch();
        });
        this.addDialogVisible = false;
        console.log(this.addForm.id);
      });
    },
    //监听关闭对话框事件
    closeAddDialog() {
      this.$refs.addFormRef.resetFields();
    },
    // 搜索证书
    searchCertificate() {
      console.log(this.queryParams);
      this.$get(`studio/certificate`, { ...this.queryParams }).then((r) => {
        const data = r.data.data;
        this.certificateList = data.rows;
        this.total = data.total;
        console.log(r);
      });
    },
    //重置搜索框数据
    resetCertificate() {
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
    //弹出申请报销对话框
    async changeReimbursement(row) {
      console.log(row);
      if (this.userInfo.userId != row.userId) {
        return this.$message.info("仅允许本人操作！");
      }
      //检查是否已报销
      if (row.reimbursement == 1) {
        return this.$message.info("此证书已经报销！");
      }
      //检查考试是否完成
      if (row.state == 0) {
        return this.$message.info("考试还未结束，请考试结束后再申请报销!");
      }
      //检查考试是否通过
      if (row.success == 0) {
        return this.$message.info("考试未通过，请通过考试再申请报销！");
      }

      //符合条件，弹出申请报销对话框
      // this.reimbursementDialogVisible = true
      const confirmResult = await this.$confirm(
        "您的报销条件已符合, 是否确认报销?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);

      if (confirmResult !== "confirm") {
        return this.$message.info("取消了报销");
      }

      this.Funding.applyTime = this.getTime();
      this.Funding.proposerId = row.userId;
      this.Funding.name = "考" + row.title + "证书报销";
      console.log(this.Funding);
      this.$post("studio/funding", {
        ...this.Funding,
      }).then((r) => {
        console.log(r);
        if (r.status == 200) {
          this.$message.success("报销成功!");
        } else {
          this.$message.error("报销失败！");
        }
      });
    },
    //修改证书对话框
    showEditDialog(row) {
      if (this.userInfo.userId != row.userId) {
        return this.$message.info("仅允许本人操作！");
      }
      //获得数据
      //浅克隆，同一源里的数值也会改变
      // this.editForm = row;
      this.editForm = Object.assign({}, row);
      this.editDialogVisible = true;
    },
    //提交修改对话框
    editCertificate() {
      this.$refs.editFormRef.validate((valid) => {
        if (!valid) return;
        //判断通过状态和考试状态是否冲突
        if (this.editForm.state == 0 && this.editForm.success == 1) {
          return this.$message.error("考试还未结束，无法将通过状态设置为成功!");
        }
        //把考证ID转为字符串
        this.editForm.id = this.editForm.id - 0;
        this.$put("studio/certificate", { ...this.editForm }).then((r) => {
          if (r.status === 200) {
            this.$message.success("修改证书成功！");
            this.editDialogVisible = false;
            this.fetch();
          } else {
            this.$message.error("修改证书失败！");
          }
        });
      });
    },
    //监听关闭对话框事件
    closeEditDialog() {
      this.$refs.editFormRef.resetFields();
    },
    //切换tab时判断是否填完基本信息
    beforeTabLeave(activeName, oldActiveName) {
      console.log(activeName);
      console.log(oldActiveName);
      if (oldActiveName === "0") {
        if (this.addForm.type == "" || this.addForm.type == null) {
          this.$message.error("请先填写类型");
          return false;
        }
      }
      if (oldActiveName === "0") {
        if (this.addForm.title == "" || this.addForm.title == null) {
          this.$message.error("请先填写证书名称");
          return false;
        }
      }
      if (oldActiveName === "0") {
        if (this.addForm.time == "" || this.addForm.time == null) {
          this.$message.error("请先填写考证时间");
          return false;
        }
      }
      if (oldActiveName === "0") {
        if (this.addForm.state == "" || this.addForm.state == null) {
          this.$message.error("请先填写考试状态");
          return false;
        }
      }
    },
    //处理图片预览效果
    handlePreview(file) {
      // console.log(file)
      this.previewPath = file.response.data.url;
      this.previewVisible = true;
    },
    //处理移除图片的操作
    // handleRemove(file) {
    //   console.log(file)
    //   //1.获取将要删除的图片的临时路径
    //   const filePath = file.response.data.tmp_path
    //   //2.从pics数组中, 找到该图片对应的索引
    //   const i = this.addForm.pics.findIndex(x => x.pic === filePath)
    //   //3.调用数组的splice方法, 把图片信息对象从pics数组中移除
    //   this.addForm.pics.splice(i, 1)

    //   console.log(this.addForm.pics)
    // },
    //监听图片上传成功的事件
    handleSuccess(response) {
      console.log(response);
      //拼接得到一个图片信息对象
      // const picInfo = { pic: response.data.tmp_path }
      // //将图片信息对象push到pics中
      // this.addForm.pics.push(picInfo)
      this.addForm.invoice = response.data.tmp_path;
      console.log(this.addForm);
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
.addFormButton {
  text-align: center;
}

.formbutton {
  text-align: center;
}
.addFormSteps {
  margin-bottom: 20px;
}
</style>
